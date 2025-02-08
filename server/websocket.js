import WebSocket from 'ws';
import { authenticateToken } from './middleware/auth';
import { BusinessEventEmitter } from './events/businessEvents';

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // businessId -> Set<WebSocket>
        this.eventEmitter = new BusinessEventEmitter();
        this.setupWebSocketServer();
    }

    setupWebSocketServer() {
        this.wss.on('connection', async (ws, req) => {
            try {
                // Authenticate connection
                const token = this.extractToken(req);
                const businessId = await authenticateToken(token);
                
                // Store client connection
                this.addClient(businessId, ws);

                // Setup message handlers
                this.setupMessageHandlers(ws, businessId);

                // Setup disconnect handler
                ws.on('close', () => this.handleDisconnect(businessId, ws));

            } catch (error) {
                console.error('WebSocket connection error:', error);
                ws.close(1008, 'Authentication failed');
            }
        });

        // Setup business event listeners
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Financial updates
        this.eventEmitter.on('financial_update', ({ businessId, data }) => {
            this.broadcastToBusinessClients(businessId, {
                type: 'financial_update',
                payload: data
            });
        });

        // Compliance updates
        this.eventEmitter.on('compliance_update', ({ businessId, data }) => {
            this.broadcastToBusinessClients(businessId, {
                type: 'compliance_update',
                payload: data
            });
        });

        // Tax updates
        this.eventEmitter.on('tax_update', ({ businessId, data }) => {
            this.broadcastToBusinessClients(businessId, {
                type: 'tax_update',
                payload: data
            });
        });

        // Document updates
        this.eventEmitter.on('document_update', ({ businessId, data }) => {
            this.broadcastToBusinessClients(businessId, {
                type: 'document_update',
                payload: data
            });
        });

        // Alert notifications
        this.eventEmitter.on('alert', ({ businessId, data }) => {
            this.broadcastToBusinessClients(businessId, {
                type: 'alert',
                payload: data
            });
        });
    }

    private setupMessageHandlers(ws, businessId) {
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                await this.handleClientMessage(businessId, data);
            } catch (error) {
                console.error('Error handling message:', error);
                this.sendError(ws, error);
            }
        });
    }

    private async handleClientMessage(businessId, data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'sync_request':
                await this.handleSyncRequest(businessId, payload);
                break;
            case 'action_complete':
                await this.handleActionComplete(businessId, payload);
                break;
            case 'settings_update':
                await this.handleSettingsUpdate(businessId, payload);
                break;
            default:
                console.warn('Unknown message type:', type);
        }
    }

    private broadcastToBusinessClients(businessId, message) {
        const clients = this.clients.get(businessId);
        if (clients) {
            const messageStr = JSON.stringify(message);
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageStr);
                }
            });
        }
    }

    private addClient(businessId, ws) {
        if (!this.clients.has(businessId)) {
            this.clients.set(businessId, new Set());
        }
        this.clients.get(businessId).add(ws);
    }

    private handleDisconnect(businessId, ws) {
        const clients = this.clients.get(businessId);
        if (clients) {
            clients.delete(ws);
            if (clients.size === 0) {
                this.clients.delete(businessId);
            }
        }
    }

    private extractToken(req) {
        // Extract token from request headers or query parameters
        const token = req.headers['authorization']?.split(' ')[1] ||
                     new URL(req.url, 'ws://localhost').searchParams.get('token');
        if (!token) {
            throw new Error('No authentication token provided');
        }
        return token;
    }

    private sendError(ws, error) {
        ws.send(JSON.stringify({
            type: 'error',
            payload: {
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            }
        }));
    }

    // Handlers for specific message types
    private async handleSyncRequest(businessId, payload) {
        // Implementation for handling sync requests
    }

    private async handleActionComplete(businessId, payload) {
        // Implementation for handling completed actions
    }

    private async handleSettingsUpdate(businessId, payload) {
        // Implementation for handling settings updates
    }
}

export default WebSocketServer; 