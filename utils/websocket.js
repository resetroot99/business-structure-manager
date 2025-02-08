class WebSocketClient {
    constructor() {
        this.socket = null;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second delay
    }

    connect(url) {
        try {
            this.socket = new WebSocket(url);
            this.setupSocketListeners();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleConnectionError();
        }
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected. Message not sent:', data);
        }
    }

    private setupSocketListeners() {
        this.socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        this.socket.addEventListener('close', () => {
            console.log('WebSocket disconnected');
            this.handleDisconnect();
        });

        this.socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            this.handleConnectionError();
        });
    }

    private handleMessage(data) {
        const { type, payload } = data;
        if (this.eventHandlers.has(type)) {
            this.eventHandlers.get(type).forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`Error in handler for event ${type}:`, error);
                }
            });
        }
    }

    private handleDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.reconnectDelay *= 2; // Exponential backoff
                this.connect(this.socket.url);
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
            this.dispatchEvent('max_reconnect_attempts');
        }
    }

    private handleConnectionError() {
        this.dispatchEvent('connection_error');
    }

    private dispatchEvent(eventName, data = null) {
        if (this.eventHandlers.has(eventName)) {
            this.eventHandlers.get(eventName).forEach(handler => handler(data));
        }
    }
}

export { WebSocketClient }; 