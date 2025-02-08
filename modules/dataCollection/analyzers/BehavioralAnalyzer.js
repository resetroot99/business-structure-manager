class BehavioralAnalyzer {
    constructor() {
        this.patternRecognizer = new PatternRecognizer();
        this.riskAnalyzer = new RiskAnalyzer();
        this.decisionAnalyzer = new DecisionAnalyzer();
    }

    async analyzeBehavior(data) {
        return {
            decisionPatterns: await this.analyzeDecisionMaking(data),
            riskTolerance: await this.assessRiskTolerance(data),
            consistency: this.evaluateConsistency(data),
            adaptability: this.measureAdaptability(data),
            reliability: this.assessReliability(data),
            stressResponse: await this.analyzeStressResponse(data)
        };
    }

    private async analyzeDecisionMaking(data) {
        return {
            speed: this.calculateDecisionSpeed(data),
            quality: this.assessDecisionQuality(data),
            consistency: this.evaluateDecisionConsistency(data),
            outcomes: await this.analyzeDecisionOutcomes(data),
            biases: this.identifyDecisionBiases(data)
        };
    }

    private async assessRiskTolerance(data) {
        return {
            financialRisk: this.analyzeFinancialRiskTaking(data),
            businessRisk: this.analyzeBusinessRiskTaking(data),
            innovationRisk: this.analyzeInnovationRiskTaking(data),
            overallTolerance: this.calculateOverallRiskTolerance(data)
        };
    }
} 