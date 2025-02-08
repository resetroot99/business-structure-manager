class RebateManager {
    constructor(businessId) {
        this.businessId = businessId;
        this.rebates = [];
        this.expenses = [];
        this.loadData();
    }

    addRebate(rebate) {
        this.rebates.push(rebate);
        this.saveData();
    }

    addExpense(expense) {
        this.expenses.push(expense);
        this.saveData();
    }

    getTotalRebates() {
        return this.rebates.reduce((sum, rebate) => sum + rebate.amount, 0);
    }

    getTotalExpenses() {
        return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }

    getAvailableRebates() {
        const today = new Date();
        return this.rebates.filter(rebate => 
            new Date(rebate.deadline) > today && !rebate.claimed
        );
    }

    claimRebate(rebateId) {
        const rebate = this.rebates.find(r => r.id === rebateId);
        if (rebate) {
            rebate.claimed = true;
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem(`rebates_${this.businessId}`, JSON.stringify(this.rebates));
        localStorage.setItem(`expenses_${this.businessId}`, JSON.stringify(this.expenses));
    }

    loadData() {
        const savedRebates = localStorage.getItem(`rebates_${this.businessId}`);
        const savedExpenses = localStorage.getItem(`expenses_${this.businessId}`);
        if (savedRebates) this.rebates = JSON.parse(savedRebates);
        if (savedExpenses) this.expenses = JSON.parse(savedExpenses);
    }
}

// California-specific rebate data
const californiaRebates = [
    {
        id: 1,
        name: 'Green Energy Rebate',
        amount: 1000,
        deadline: '2023-12-31',
        description: 'For businesses implementing green energy solutions'
    },
    {
        id: 2,
        name: 'Small Business Grant',
        amount: 5000,
        deadline: '2024-06-30',
        description: 'For qualifying small businesses in California'
    }
];

function initRebateManager() {
    const rebateManager = new RebateManager('business123');
    // Initialize with some rebates if none exist
    if (rebateManager.rebates.length === 0) {
        californiaRebates.forEach(rebate => rebateManager.addRebate(rebate));
    }
}

document.addEventListener('DOMContentLoaded', initRebateManager); 