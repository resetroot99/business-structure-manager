class DocumentManager {
    constructor(businessId) {
        this.businessId = businessId;
        this.documents = new Map();
        this.categories = new Set(['legal', 'financial', 'compliance', 'contracts']);
        this.encryptionKey = null;
        this.loadDocuments();
    }

    async uploadDocument(file, category, metadata = {}) {
        try {
            const encrypted = await this.encryptDocument(file);
            const documentId = `doc_${Date.now()}`;
            
            const document = {
                id: documentId,
                name: file.name,
                category,
                metadata: {
                    ...metadata,
                    uploadDate: new Date(),
                    lastModified: new Date(file.lastModified),
                    size: file.size
                },
                encrypted,
                hash: await this.calculateHash(file)
            };

            this.documents.set(documentId, document);
            await this.saveToIPFS(document);
            return documentId;
        } catch (error) {
            console.error('Document upload error:', error);
            throw error;
        }
    }

    async encryptDocument(file) {
        // Implement document encryption
        return file;
    }

    async calculateHash(file) {
        // Calculate document hash for verification
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async saveToIPFS(document) {
        // Implement IPFS storage
    }

    getDocumentsByCategory(category) {
        return Array.from(this.documents.values())
            .filter(doc => doc.category === category);
    }

    async shareDocument(documentId, recipientId, permissions) {
        const document = this.documents.get(documentId);
        if (!document) throw new Error('Document not found');

        // Create sharing record
        const sharingRecord = {
            documentId,
            recipientId,
            permissions,
            sharedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };

        // Store sharing record
        document.metadata.shared = document.metadata.shared || [];
        document.metadata.shared.push(sharingRecord);
    }

    addDocument(document) {
        this.documents.set(document.id, document);
        this.saveDocuments();
    }

    getRequiredDocuments() {
        return Array.from(this.documents.values()).filter(doc => doc.required);
    }

    getSharedDocuments() {
        return Array.from(this.documents.values()).filter(doc => doc.shared);
    }

    saveDocuments() {
        localStorage.setItem(`documents_${this.businessId}`, JSON.stringify(Array.from(this.documents.values())));
    }

    loadDocuments() {
        const saved = localStorage.getItem(`documents_${this.businessId}`);
        if (saved) {
            const documents = JSON.parse(saved);
            documents.forEach(doc => this.documents.set(doc.id, doc));
        }
    }

    renderDocuments() {
        const container = document.getElementById('documentList');
        container.innerHTML = Array.from(this.documents.values()).map(doc => `
            <div class="card">
                <h3>${doc.name}</h3>
                <p>Category: ${doc.category}</p>
                <p>Renewal Date: ${doc.renewalDate || 'Not set'}</p>
            </div>
        `).join('');
    }
}

// California-specific document requirements
const californiaDocuments = [
    {
        id: 1,
        name: 'Business License',
        required: true,
        description: 'Required for all businesses operating in California'
    },
    {
        id: 2,
        name: 'Seller\'s Permit',
        required: true,
        description: 'Required for businesses selling goods in California'
    }
];

function initDocumentManager() {
    const documentManager = new DocumentManager('business123');
    // Initialize with required documents if none exist
    if (documentManager.documents.size === 0) {
        californiaDocuments.forEach(doc => documentManager.addDocument(doc));
    }
}

document.addEventListener('DOMContentLoaded', initDocumentManager); 