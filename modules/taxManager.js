class TaxManager {
    constructor(businessId) {
        this.businessId = businessId;
        this.taxData = [];
        this.loadTaxData();
    }

    addTaxRecord(record) {
        this.taxData.push(record);
        this.saveTaxData();
    }

    getUpcomingTaxes() {
        const today = new Date();
        return this.taxData.filter(record => new Date(record.deadline) > today);
    }

    saveTaxData() {
        localStorage.setItem(`taxData_${this.businessId}`, JSON.stringify(this.taxData));
    }

    loadTaxData() {
        const saved = localStorage.getItem(`taxData_${this.businessId}`);
        if (saved) this.taxData = JSON.parse(saved);
    }
}

// California tax rates by county
const californiaTaxRates = {
    'Los Angeles': 0.095,
    'San Diego': 0.078,
    'Orange': 0.0775,
    'Riverside': 0.0825,
    'San Bernardino': 0.0815,
    // Add more counties as needed
};

function updateTaxRates() {
    const countySelect = document.getElementById('county');
    const selectedCounty = countySelect.value;
    const taxRate = californiaTaxRates[selectedCounty] || 0;
    document.getElementById('taxResult').textContent = `Tax Rate: ${(taxRate * 100).toFixed(2)}%`;
}

function calculateTax() {
    const income = parseFloat(document.getElementById('income').value);
    const county = document.getElementById('county').value;
    const taxRate = californiaTaxRates[county] || 0;
    
    if (isNaN(income)) {
        alert('Please enter a valid income amount');
        return;
    }
    
    const taxAmount = income * taxRate;
    document.getElementById('taxResult').textContent = `Estimated Tax: $${taxAmount.toFixed(2)}`;
}

// Initialize county select
function initTaxManager() {
    const countySelect = document.getElementById('county');
    Object.keys(californiaTaxRates).forEach(county => {
        const option = document.createElement('option');
        option.value = county;
        option.textContent = county;
        countySelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', initTaxManager); 