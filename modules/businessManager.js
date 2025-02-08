class BusinessManager {
    constructor() {
        this.businesses = [];
        this.currentBusiness = null;
        this.loadBusinesses();
    }

    addBusiness(business) {
        business.id = Date.now().toString();
        this.businesses.push(business);
        this.saveBusinesses();
        this.renderBusinessSelector();
    }

    switchBusiness(id) {
        this.currentBusiness = this.businesses.find(b => b.id === id);
        this.renderDashboard();
    }

    renderBusinessSelector() {
        const selector = document.getElementById('businessSelector');
        selector.innerHTML = this.businesses.map(b => `
            <option value="${b.id}">${b.name}</option>
        `).join('');
    }

    saveBusinesses() {
        localStorage.setItem('businesses', JSON.stringify(this.businesses));
    }

    loadBusinesses() {
        const saved = localStorage.getItem('businesses');
        if (saved) this.businesses = JSON.parse(saved);
    }
} 