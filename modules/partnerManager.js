class PartnerManager {
    constructor(businessId) {
        this.businessId = businessId;
        this.partners = [];
        this.loadPartners();
    }

    addPartner(partner) {
        this.partners.push(partner);
        this.savePartners();
    }

    shareData(partnerId, data) {
        const partner = this.partners.find(p => p.id === partnerId);
        if (partner) {
            partner.sharedData = data;
            this.savePartners();
        }
    }

    savePartners() {
        localStorage.setItem(`partners_${this.businessId}`, JSON.stringify(this.partners));
    }

    loadPartners() {
        const saved = localStorage.getItem(`partners_${this.businessId}`);
        if (saved) this.partners = JSON.parse(saved);
    }
}

let partners = [];

function invitePartner() {
    const email = prompt('Enter partner\'s email address:');
    if (email) {
        partners.push({ email, status: 'Pending' });
        updatePartnerList();
    }
}

function shareDocuments() {
    if (partners.length === 0) {
        alert('No partners to share with. Please invite partners first.');
        return;
    }
    
    const documentList = document.getElementById('documentList');
    const documents = Array.from(documentList.children).map(li => li.textContent);
    
    // Simulate document sharing
    alert(`Sharing ${documents.length} documents with ${partners.length} partners`);
}

function updatePartnerList() {
    const partnerList = document.getElementById('partnerList');
    partnerList.innerHTML = partners
        .map((partner, index) => `
            <li>
                ${partner.email} - ${partner.status}
                <button onclick="removePartner(${index})">Remove</button>
            </li>
        `)
        .join('');
    
    document.getElementById('activePartners').textContent = partners.length;
}

function removePartner(index) {
    partners.splice(index, 1);
    updatePartnerList();
}

function initPartnerManager() {
    updatePartnerList();
}

document.addEventListener('DOMContentLoaded', initPartnerManager); 