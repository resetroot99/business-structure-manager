class StrategicAdvisor {
    constructor(businessAnalyzer) {
        this.analyzer = businessAnalyzer;
        this.recommendations = [];
        this.industryBenchmarks = this.loadIndustryBenchmarks();
    }

    private async loadIndustryBenchmarks() {
        try {
            const response = await fetch('/api/industry-benchmarks');
            return await response.json();
        } catch (error) {
            console.error('Error loading industry benchmarks:', error);
            return {};
        }
    }

    async generateStrategicPlan() {
        const insights = await this.analyzer.generateBusinessInsights();
        return {
            shortTerm: this.generateShortTermStrategy(insights),
            mediumTerm: this.generateMediumTermStrategy(insights),
            longTerm: this.generateLongTermStrategy(insights),
            actionItems: this.createActionItems(insights)
        };
    }

    async analyzeGrowthOpportunities() {
        const insights = await this.analyzer.generateBusinessInsights();
        return {
            marketExpansion: this.assessMarketExpansion(insights),
            productDevelopment: this.assessProductDevelopment(insights),
            partnerships: this.identifyPartnershipOpportunities(insights),
            acquisition: this.evaluateAcquisitionOpportunities(insights)
        };
    }

    async generateRiskReport() {
        const insights = await this.analyzer.generateBusinessInsights();
        return {
            operationalRisks: this.identifyOperationalRisks(insights),
            financialRisks: this.assessFinancialRisks(insights),
            legalRisks: this.evaluateLegalRisks(insights),
            marketRisks: this.analyzeMarketRisks(insights),
            mitigationStrategies: this.developRiskMitigation(insights)
        };
    }

    async createActionablePlan() {
        const strategicPlan = await this.generateStrategicPlan();
        const growthOpportunities = await this.analyzeGrowthOpportunities();
        const riskReport = await this.generateRiskReport();

        return {
            immediate: this.prioritizeActions(strategicPlan.shortTerm),
            next30Days: this.createTimeline(30, strategicPlan),
            next90Days: this.createTimeline(90, strategicPlan),
            next12Months: this.createAnnualPlan(strategicPlan),
            keyMetrics: this.defineKeyMetrics(),
            monitoringPlan: this.createMonitoringPlan()
        };
    }

    // Private helper methods
    private generateShortTermStrategy(insights) {
        const strategies = [];
        const { financialHealth, compliance, taxOptimizations } = insights;

        // Cash flow optimization
        if (financialHealth.cashFlow.current.netCashFlow < 0) {
            strategies.push({
                type: 'cash_flow',
                priority: 'high',
                action: 'Implement immediate cash flow management',
                steps: [
                    'Review and reduce non-essential expenses',
                    'Accelerate accounts receivable collection',
                    'Negotiate better payment terms with suppliers'
                ]
            });
        }

        // Compliance issues
        const urgentCompliance = this.findUrgentComplianceIssues(compliance);
        if (urgentCompliance.length > 0) {
            strategies.push({
                type: 'compliance',
                priority: 'critical',
                action: 'Address compliance issues',
                items: urgentCompliance
            });
        }

        // Tax optimization
        if (taxOptimizations.potentialSavings > 10000) {
            strategies.push({
                type: 'tax',
                priority: 'high',
                action: 'Implement tax saving strategies',
                strategies: taxOptimizations.recommendations
            });
        }

        return strategies;
    }

    private generateMediumTermStrategy(insights) {
        const { fundingOpportunities, legalStructure } = insights;
        const strategies = [];

        // Funding strategies
        if (fundingOpportunities.sbaLoans.eligible) {
            strategies.push({
                type: 'funding',
                priority: 'medium',
                action: 'Apply for SBA loan',
                details: fundingOpportunities.sbaLoans,
                timeline: '3-6 months'
            });
        }

        // Legal structure optimization
        if (legalStructure.optimalStructure !== legalStructure.currentStructure) {
            strategies.push({
                type: 'legal',
                priority: 'medium',
                action: 'Restructure business entity',
                recommendation: legalStructure.optimalStructure,
                benefits: this.calculateRestructuringBenefits(legalStructure)
            });
        }

        return strategies;
    }

    private generateLongTermStrategy(insights) {
        return {
            expansion: this.analyzeExpansionOpportunities(insights),
            diversification: this.analyzeDiversificationOptions(insights),
            marketPosition: this.analyzeMarketPosition(insights),
            succession: this.developSuccessionPlan(insights)
        };
    }

    private createActionItems(insights) {
        const actionItems = [];
        const { financialHealth, compliance, taxOptimizations } = insights;

        // Immediate actions
        if (financialHealth.creditScore < 700) {
            actionItems.push({
                type: 'credit_improvement',
                priority: 'high',
                deadline: '30 days',
                tasks: this.generateCreditImprovementTasks(financialHealth)
            });
        }

        // Upcoming deadlines
        compliance.upcomingRenewals.forEach(renewal => {
            actionItems.push({
                type: 'compliance',
                priority: this.calculateDeadlinePriority(renewal.deadline),
                deadline: renewal.deadline,
                description: renewal.description,
                requirements: renewal.requirements
            });
        });

        return actionItems;
    }

    private prioritizeActions(actions) {
        const priorityWeights = {
            'critical': 10,
            'high': 7,
            'medium': 5,
            'low': 3
        };

        return actions.sort((a, b) => {
            // Sort by priority first
            const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Then by deadline if available
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }

            return 0;
        });
    }

    private createTimeline(days, plan) {
        const timeline = {
            milestones: [],
            dependencies: [],
            criticalPath: []
        };

        // Convert strategies to timeline milestones
        plan.shortTerm.forEach(strategy => {
            if (days >= 30) { // Only include if within timeline scope
                timeline.milestones.push({
                    id: `milestone_${Date.now()}`,
                    type: strategy.type,
                    action: strategy.action,
                    deadline: this.calculateDeadline(strategy, days),
                    dependencies: this.identifyDependencies(strategy),
                    resources: this.estimateResourceNeeds(strategy)
                });
            }
        });

        // Add medium-term strategies for longer timelines
        if (days >= 90) {
            plan.mediumTerm.forEach(strategy => {
                timeline.milestones.push({
                    id: `milestone_${Date.now()}`,
                    type: strategy.type,
                    action: strategy.action,
                    deadline: this.calculateDeadline(strategy, days),
                    dependencies: this.identifyDependencies(strategy),
                    resources: this.estimateResourceNeeds(strategy)
                });
            });
        }

        // Calculate critical path
        timeline.criticalPath = this.calculateCriticalPath(timeline.milestones);

        return timeline;
    }

    private defineKeyMetrics() {
        return {
            financial: [
                {
                    name: 'Operating Cash Flow',
                    target: 'Positive and increasing',
                    frequency: 'Monthly',
                    source: 'Cash Flow Statement'
                },
                {
                    name: 'Gross Profit Margin',
                    target: '> Industry Average',
                    frequency: 'Monthly',
                    source: 'Income Statement'
                }
            ],
            operational: [
                {
                    name: 'Customer Acquisition Cost',
                    target: 'Decreasing',
                    frequency: 'Quarterly',
                    source: 'Marketing Analytics'
                },
                {
                    name: 'Customer Retention Rate',
                    target: '> 85%',
                    frequency: 'Monthly',
                    source: 'CRM Data'
                }
            ],
            compliance: [
                {
                    name: 'Compliance Score',
                    target: '100%',
                    frequency: 'Monthly',
                    source: 'Compliance Tracker'
                }
            ]
        };
    }

    private findUrgentComplianceIssues(compliance) {
        const urgentIssues = [];
        const today = new Date();

        // Check expired items
        compliance.licenses.forEach(license => {
            if (new Date(license.expirationDate) < today) {
                urgentIssues.push({
                    type: 'license_expired',
                    item: license.name,
                    deadline: license.expirationDate,
                    impact: 'Critical',
                    action: 'Immediate renewal required'
                });
            }
        });

        // Check upcoming deadlines
        compliance.upcomingRenewals.forEach(renewal => {
            const daysUntilDue = this.calculateDaysBetween(today, new Date(renewal.deadline));
            if (daysUntilDue <= 30) {
                urgentIssues.push({
                    type: 'upcoming_renewal',
                    item: renewal.description,
                    deadline: renewal.deadline,
                    impact: daysUntilDue <= 7 ? 'Critical' : 'High',
                    action: 'Prepare renewal documentation'
                });
            }
        });

        // Check missing requirements
        compliance.missingRequirements.forEach(requirement => {
            urgentIssues.push({
                type: 'missing_requirement',
                item: requirement.name,
                impact: requirement.mandatory ? 'Critical' : 'High',
                action: 'Obtain required documentation/certification'
            });
        });

        return urgentIssues;
    }

    private calculateRestructuringBenefits(legalStructure) {
        const currentStructure = legalStructure.currentStructure;
        const optimalStructure = legalStructure.optimalStructure;
        
        return {
            taxSavings: this.calculateTaxDifference(currentStructure, optimalStructure),
            liabilityProtection: this.compareLiabilityProtection(currentStructure, optimalStructure),
            operationalEfficiency: this.compareOperationalEfficiency(currentStructure, optimalStructure),
            fundingAccess: this.compareFundingAccess(currentStructure, optimalStructure),
            timeline: this.estimateRestructuringTimeline(currentStructure, optimalStructure),
            costs: this.estimateRestructuringCosts(currentStructure, optimalStructure)
        };
    }

    private generateCreditImprovementTasks(financialHealth) {
        const tasks = [];
        const { creditScore, creditUtilization, paymentHistory } = financialHealth;

        // Payment history improvements
        if (paymentHistory.latePayments > 0) {
            tasks.push({
                action: 'Set up automatic payments',
                impact: 'High',
                timeline: 'Immediate',
                benefit: 'Prevent future late payments'
            });
        }

        // Credit utilization improvements
        if (creditUtilization > 30) {
            tasks.push({
                action: 'Reduce credit utilization',
                impact: 'High',
                timeline: '60 days',
                target: 'Below 30%',
                steps: [
                    'Pay down highest utilization accounts first',
                    'Request credit limit increases',
                    'Consider consolidation options'
                ]
            });
        }

        return tasks;
    }

    private calculateDeadlinePriority(deadline) {
        const daysUntilDeadline = this.calculateDaysBetween(new Date(), new Date(deadline));
        
        if (daysUntilDeadline <= 7) return 'critical';
        if (daysUntilDeadline <= 30) return 'high';
        if (daysUntilDeadline <= 90) return 'medium';
        return 'low';
    }

    // Utility methods
    private calculateDaysBetween(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private calculateDeadline(strategy, timelineLength) {
        // Implementation
    }

    private identifyDependencies(strategy) {
        // Implementation
    }

    private estimateResourceNeeds(strategy) {
        // Implementation
    }

    private calculateCriticalPath(milestones) {
        // Implementation
    }

    private assessMarketExpansion(insights) {
        return {
            geographicOpportunities: this.identifyGeographicOpportunities(insights),
            marketSegments: this.analyzeNewMarketSegments(insights),
            entryBarriers: this.assessMarketEntryBarriers(insights),
            competitiveAnalysis: this.performCompetitiveAnalysis(insights)
        };
    }

    private assessProductDevelopment(insights) {
        return {
            opportunities: this.identifyProductOpportunities(insights),
            resourceRequirements: this.calculateResourceNeeds(insights),
            timeline: this.estimateDevelopmentTimeline(insights),
            risks: this.assessDevelopmentRisks(insights)
        };
    }

    private identifyPartnershipOpportunities(insights) {
        return {
            potentialPartners: this.findPotentialPartners(insights),
            synergies: this.analyzePotentialSynergies(insights),
            risks: this.assessPartnershipRisks(insights),
            structureRecommendations: this.recommendPartnershipStructures(insights)
        };
    }

    private evaluateAcquisitionOpportunities(insights) {
        return {
            targets: this.identifyAcquisitionTargets(insights),
            valuations: this.performValuations(insights),
            synergies: this.calculateAcquisitionSynergies(insights),
            risks: this.assessAcquisitionRisks(insights),
            financingOptions: this.exploreFinancingOptions(insights)
        };
    }

    private createMonitoringPlan() {
        return {
            metrics: this.defineKeyMetrics(),
            frequency: this.determineMonitoringFrequency(),
            thresholds: this.setAlertThresholds(),
            reportingStructure: this.createReportingStructure()
        };
    }
}

export default StrategicAdvisor; 