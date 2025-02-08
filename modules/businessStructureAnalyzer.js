class BusinessStructureAnalyzer {
    constructor(businessData) {
        this.businessData = businessData;
        this.taxRates = this.loadTaxRates();
        this.stateRegulations = this.loadStateRegulations();
    }

    async analyzeOptimalStructure() {
        const analysis = {
            currentStructure: this.analyzeCurrentStructure(),
            w2Scenario: await this.calculateW2Scenario(),
            k1Scenario: await this.calculateK1Scenario(),
            recommendation: null
        };

        // Compare scenarios and provide recommendation
        analysis.recommendation = this.compareScenarios(analysis.w2Scenario, analysis.k1Scenario);
        return analysis;
    }

    private async calculateW2Scenario() {
        const payrollTaxes = this.calculatePayrollTaxes();
        const corporateTaxes = this.calculateCorporateTaxes();
        const benefits = this.calculateEmployeeBenefits();

        return {
            totalTaxBurden: payrollTaxes + corporateTaxes,
            netIncome: this.calculateNetIncome('w2'),
            benefits: benefits,
            advantages: this.getW2Advantages(),
            disadvantages: this.getW2Disadvantages()
        };
    }

    private async calculateK1Scenario() {
        const selfEmploymentTax = this.calculateSelfEmploymentTax();
        const passthrough = this.calculatePassthroughTax();
        const writeoffs = this.calculateBusinessWriteoffs();

        return {
            totalTaxBurden: selfEmploymentTax + passthrough,
            netIncome: this.calculateNetIncome('k1'),
            writeoffs: writeoffs,
            advantages: this.getK1Advantages(),
            disadvantages: this.getK1Disadvantages()
        };
    }
} 