class StrategyManager {
    constructor(businessId) {
        this.businessId = businessId;
        this.strategies = [];
        this.loadStrategies();
    }

    addStrategy(strategy) {
        this.strategies.push(strategy);
        this.saveStrategies();
    }

    getTaxOptimizationStrategies() {
        return this.strategies.filter(strategy => strategy.type === 'tax_optimization');
    }

    saveStrategies() {
        localStorage.setItem(`strategies_${this.businessId}`, JSON.stringify(this.strategies));
    }

    loadStrategies() {
        const saved = localStorage.getItem(`strategies_${this.businessId}`);
        if (saved) this.strategies = JSON.parse(saved);
    }
} 