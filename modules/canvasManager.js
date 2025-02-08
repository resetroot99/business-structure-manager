class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('businessCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.ventures = new Map(); // Store venture data
        this.assets = new Map();   // Store asset data
        this.initializeCanvas();
    }

    initializeCanvas() {
        this.setupEventListeners();
        this.addToolbar();
        this.loadSavedData();
    }

    addVenture(data) {
        const ventureNode = {
            id: `venture_${Date.now()}`,
            type: 'venture',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 150,
            height: 80,
            data: {
                name: data.name,
                type: data.type,
                status: data.status,
                financials: data.financials,
                analyzer: new BusinessAnalyzer(data.id)
            }
        };
        this.nodes.push(ventureNode);
        this.ventures.set(ventureNode.id, data);
        this.renderCanvas();
    }

    addAsset(data) {
        const assetNode = {
            id: `asset_${Date.now()}`,
            type: 'asset',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 120,
            height: 60,
            data: {
                name: data.name,
                type: data.type,
                value: data.value,
                status: data.status,
                documents: data.documents
            }
        };
        this.nodes.push(assetNode);
        this.assets.set(assetNode.id, data);
        this.renderCanvas();
    }

    renderNode(node) {
        const colors = {
            venture: '#2c3e50',
            asset: '#27ae60',
            liability: '#c0392b'
        };

        // Draw node background
        this.ctx.fillStyle = colors[node.type] || '#34495e';
        this.ctx.fillRect(node.x, node.y, node.width, node.height);

        // Draw node content
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(node.data.name, node.x + node.width/2, node.y + 20);
        
        // Draw status indicator
        this.ctx.fillStyle = this.getStatusColor(node.data.status);
        this.ctx.beginPath();
        this.ctx.arc(node.x + node.width - 10, node.y + 10, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw financial indicators if venture
        if (node.type === 'venture') {
            this.drawFinancialIndicators(node);
        }
    }

    drawFinancialIndicators(node) {
        const metrics = node.data.analyzer.analyzeFinancialHealth();
        const y = node.y + 35;
        
        // Draw mini charts or indicators
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`ROI: ${metrics.roi}%`, node.x + 30, y);
        this.ctx.fillText(`Risk: ${metrics.riskLevel}`, node.x + node.width - 30, y);
    }

    addToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'canvas-toolbar';
        
        const buttons = [
            { text: 'Add Venture', onclick: () => this.showVentureForm() },
            { text: 'Add Asset', onclick: () => this.showAssetForm() },
            { text: 'Connect', onclick: () => this.enableConnectionMode() },
            { text: 'Analyze', onclick: () => this.analyzeSelected() }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'btn';
            button.textContent = btn.text;
            button.onclick = btn.onclick;
            toolbar.appendChild(button);
        });

        document.querySelector('.canvas-container').appendChild(toolbar);
    }

    showVentureForm() {
        // Create modal for venture details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>New Venture</h3>
                <form id="ventureForm">
                    <input type="text" placeholder="Venture Name" required>
                    <select required>
                        <option value="">Select Type</option>
                        <option value="business">Business</option>
                        <option value="project">Project</option>
                        <option value="investment">Investment</option>
                    </select>
                    <input type="number" placeholder="Initial Investment" required>
                    <button type="submit">Create</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    analyzeSelected() {
        if (!this.selectedNode) return;

        const node = this.selectedNode;
        let analysis;

        if (node.type === 'venture') {
            analysis = node.data.analyzer.generateFullAnalysis();
        } else if (node.type === 'asset') {
            analysis = this.analyzeAsset(node.data);
        }

        this.showAnalysisModal(analysis);
    }

    showAnalysisModal(analysis) {
        // Create and show modal with analysis results
        const modal = document.createElement('div');
        modal.className = 'modal analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Analysis Results</h3>
                <div class="analysis-results">
                    ${this.formatAnalysisResults(analysis)}
                </div>
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    formatAnalysisResults(analysis) {
        // Format analysis results into HTML
        return `
            <div class="analysis-section">
                <h4>Financial Health</h4>
                <p>Credit Score: ${analysis.financials.creditScore}</p>
                <p>Cash Flow: ${analysis.financials.cashFlow}</p>
            </div>
            <div class="analysis-section">
                <h4>Opportunities</h4>
                <ul>
                    ${analysis.opportunities.map(opp => `<li>${opp}</li>`).join('')}
                </ul>
            </div>
            <div class="analysis-section">
                <h4>Risks</h4>
                <ul>
                    ${analysis.risks.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

let canvas, ctx;
let nodes = [];
let connections = [];
let partnerships = [];

function initCanvas() {
    canvas = document.getElementById('businessCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    renderCanvas();
    
    // Add partnership button
    const partnershipBtn = document.createElement('button');
    partnershipBtn.className = 'btn';
    partnershipBtn.textContent = 'Create Partnership';
    partnershipBtn.onclick = () => {
        if (selectedNodes.length === 2) {
            createPartnership(selectedNodes[0], selectedNodes[1]);
        } else {
            alert('Select exactly 2 nodes to create a partnership');
        }
    };
    document.querySelector('.canvas-tools').appendChild(partnershipBtn);
}

function addNode() {
    const node = {
        id: nodes.length + 1,
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 100,
        height: 50,
        text: `Node ${nodes.length + 1}`
    };
    nodes.push(node);
    renderCanvas();
}

function connectNodes() {
    if (nodes.length < 2) {
        alert('Need at least 2 nodes to connect');
        return;
    }
    
    const connection = {
        from: nodes[0].id,
        to: nodes[1].id
    };
    connections.push(connection);
    renderCanvas();
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        ctx.beginPath();
        ctx.moveTo(fromNode.x + fromNode.width/2, fromNode.y + fromNode.height/2);
        ctx.lineTo(toNode.x + toNode.width/2, toNode.y + toNode.height/2);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw partnerships
    partnerships.forEach(partnership => {
        const fromNode = nodes.find(n => n.id === partnership.fromNodeId);
        const toNode = nodes.find(n => n.id === partnership.toNodeId);
        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x + fromNode.width/2, fromNode.y + fromNode.height/2);
            ctx.lineTo(toNode.x + toNode.width/2, toNode.y + toNode.height/2);
            ctx.strokeStyle = partnership.signed ? '#2ecc71' : '#e74c3c';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw partnership details
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(
                partnership.terms,
                (fromNode.x + toNode.x)/2,
                (fromNode.y + toNode.y)/2
            );
        }
    });
    
    // Draw nodes with special styling for funding nodes
    nodes.forEach(node => {
        if (node.type === 'funding') {
            ctx.fillStyle = '#27ae60';
            // Draw progress bar
            const progress = node.raisedAmount / node.fundingGoal;
            ctx.fillRect(node.x, node.y, node.width * progress, 5);
        } else {
            ctx.fillStyle = '#2c3e50';
        }
        
        ctx.fillRect(node.x, node.y, node.width, node.height);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.text, node.x + node.width/2, node.y + node.height/2 + 5);
    });
}

function saveCanvas() {
    const data = {
        nodes,
        connections,
        partnerships
    };
    localStorage.setItem('canvasData', JSON.stringify(data));
    alert('Canvas saved successfully');
}

function loadCanvas() {
    const data = JSON.parse(localStorage.getItem('canvasData'));
    if (data) {
        nodes = data.nodes || [];
        connections = data.connections || [];
        partnerships = data.partnerships || [];
        renderCanvas();
    }
}

// Mouse interaction handlers
let selectedNode = null;
let offset = { x: 0, y: 0 };

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    selectedNode = nodes.find(node => 
        x >= node.x && x <= node.x + node.width &&
        y >= node.y && y <= node.y + node.height
    );
    
    if (selectedNode) {
        offset.x = x - selectedNode.x;
        offset.y = y - selectedNode.y;
    }
}

function handleMouseMove(e) {
    if (selectedNode) {
        const rect = canvas.getBoundingClientRect();
        selectedNode.x = e.clientX - rect.left - offset.x;
        selectedNode.y = e.clientY - rect.top - offset.y;
        renderCanvas();
    }
}

function handleMouseUp() {
    selectedNode = null;
}

class Partnership {
    constructor(fromNodeId, toNodeId, terms) {
        this.id = Date.now().toString();
        this.fromNodeId = fromNodeId;
        this.toNodeId = toNodeId;
        this.terms = terms;
        this.signed = false;
        this.createdAt = new Date();
    }

    sign() {
        this.signed = true;
        this.signedAt = new Date();
    }
}

function createPartnership(fromNodeId, toNodeId) {
    const terms = prompt('Enter partnership terms:');
    if (terms) {
        const partnership = new Partnership(fromNodeId, toNodeId, terms);
        partnerships.push(partnership);
        saveCanvas();
        renderCanvas();
    }
}

function signPartnership(partnershipId) {
    const partnership = partnerships.find(p => p.id === partnershipId);
    if (partnership) {
        partnership.sign();
        saveCanvas();
        renderCanvas();
    }
}

function createFundingNode() {
    const node = {
        id: nodes.length + 1,
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 120,
        height: 60,
        text: 'Funding Node',
        type: 'funding',
        fundingGoal: 0,
        raisedAmount: 0,
        contributors: []
    };
    nodes.push(node);
    renderCanvas();
}

function contributeToNode(nodeId, amount) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'funding') return;
    
    node.raisedAmount += amount;
    node.contributors.push({
        amount,
        timestamp: new Date()
    });
    
    // Update token balances
    tokenManager.contribute(node.fundingRoundId, 'userAddress', amount);
    renderCanvas();
}

document.addEventListener('DOMContentLoaded', initCanvas); 