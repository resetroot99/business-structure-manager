class BusinessAnalyzer {
    constructor(businessId) {
        this.businessId = businessId;
        this.businessData = {};
        this.opportunities = [];
        this.risks = [];
        this.loadBusinessData();
    }

    async analyzeFinancialHealth() {
        const data = await this.gatherFinancialData();
        return {
            creditScore: await this.calculateBusinessCreditScore(data),
            debtToIncomeRatio: this.calculateDTI(data),
            cashFlow: this.analyzeCashFlow(data),
            eligibleLoans: await this.findEligibleLoans(data),
            creditLines: await this.assessCreditLineOpportunities(data)
        };
    }

    async findFundingOpportunities() {
        const financialHealth = await this.analyzeFinancialHealth();
        return {
            lineOfCredit: {
                eligible: this.businessData.yearsInBusiness > 2,
                maxAmount: this.calculateMaxCreditLine(),
                requirements: ['2+ years in business', 'Good credit score']
            },
            sbaLoans: await this.checkSBALoanEligibility(),
            assetBasedLoans: await this.calculateAssetBasedLending(),
            governmentGrants: await this.findAvailableGrants()
        };
    }

    async assessCompliance() {
        return {
            licenses: await this.checkLicenseStatus(),
            permits: await this.checkRequiredPermits(),
            certifications: await this.checkCertifications(),
            upcomingRenewals: await this.getUpcomingRenewals(),
            missingRequirements: await this.findMissingRequirements()
        };
    }

    async analyzeLegalStructure() {
        return {
            currentStructure: await this.getCurrentLegalStructure(),
            optimalStructure: await this.recommendOptimalStructure(),
            taxImplications: await this.analyzeTaxImplications(),
            liabilityExposure: await this.assessLiabilityExposure()
        };
    }

    async findTaxOptimizations() {
        const structure = await this.analyzeLegalStructure();
        return {
            recommendations: this.generateTaxRecommendations(structure),
            potentialSavings: this.calculatePotentialSavings(),
            deductions: await this.findEligibleDeductions(),
            strategies: this.suggestTaxStrategies()
        };
    }

    async generateBusinessInsights() {
        return {
            financialHealth: await this.analyzeFinancialHealth(),
            fundingOpportunities: await this.findFundingOpportunities(),
            compliance: await this.assessCompliance(),
            legalStructure: await this.analyzeLegalStructure(),
            taxOptimizations: await this.findTaxOptimizations()
        };
    }

    // Private helper methods
    private async gatherFinancialData() {
        try {
            const data = {
                revenue: await this.getRevenueData(),
                expenses: await this.getExpenseData(),
                assets: await this.getAssetData(),
                liabilities: await this.getLiabilityData(),
                cashFlow: await this.getCashFlowData(),
                creditHistory: await this.getCreditHistory()
            };

            // Calculate key financial ratios
            data.ratios = {
                currentRatio: data.assets.current / data.liabilities.current,
                quickRatio: (data.assets.current - data.assets.inventory) / data.liabilities.current,
                debtToEquity: data.liabilities.total / (data.assets.total - data.liabilities.total),
                profitMargin: (data.revenue.total - data.expenses.total) / data.revenue.total
            };

            return data;
        } catch (error) {
            console.error('Error gathering financial data:', error);
            throw error;
        }
    }

    private async calculateBusinessCreditScore(data) {
        const factors = {
            paymentHistory: this.analyzePaymentHistory(data.creditHistory),
            creditUtilization: this.calculateCreditUtilization(data),
            creditMix: this.analyzeCreditMix(data),
            accountAges: this.calculateAccountAges(data.creditHistory),
            recentInquiries: this.countRecentInquiries(data.creditHistory)
        };

        // Weight factors and calculate score
        const score = (
            factors.paymentHistory * 0.35 +
            factors.creditUtilization * 0.30 +
            factors.creditMix * 0.15 +
            factors.accountAges * 0.10 +
            factors.recentInquiries * 0.10
        ) * 850; // Scale to 850 max score

        return Math.round(score);
    }

    private calculateDTI(data) {
        const monthlyDebt = this.calculateTotalMonthlyDebt(data.liabilities);
        const monthlyIncome = this.calculateMonthlyIncome(data.revenue);
        return (monthlyDebt / monthlyIncome).toFixed(2);
    }

    private async analyzeCashFlow(data) {
        const periods = this.splitIntoPeriods(data.cashFlow);
        const analysis = periods.map(period => ({
            netCashFlow: this.calculateNetCashFlow(period),
            operatingCashFlow: this.calculateOperatingCashFlow(period),
            investingCashFlow: this.calculateInvestingCashFlow(period),
            financingCashFlow: this.calculateFinancingCashFlow(period),
            trends: this.analyzeCashFlowTrends(period)
        }));

        return {
            current: analysis[analysis.length - 1],
            historical: analysis,
            projections: this.projectCashFlow(analysis),
            recommendations: this.generateCashFlowRecommendations(analysis)
        };
    }

    private async checkSBALoanEligibility() {
        const requirements = {
            operatingInUS: true,
            forProfit: true,
            ownerInvested: true,
            exhaustedFinancing: true
        };

        const size = await this.checkBusinessSize();
        const industry = await this.getIndustryClassification();
        const financials = await this.gatherFinancialData();

        return {
            eligible: this.meetsSBARequirements(requirements, size, industry),
            maxLoanAmount: this.calculateMaxSBALoan(financials),
            programs: this.getEligibleSBAPrograms(size, industry),
            requirements: this.getMissingRequirements(requirements)
        };
    }

    private async findAvailableGrants() {
        const businessProfile = await this.getBusinessProfile();
        const grants = [];

        // Check federal grants
        const federalGrants = await this.searchFederalGrants(businessProfile);
        grants.push(...federalGrants);

        // Check state grants
        const stateGrants = await this.searchStateGrants(businessProfile);
        grants.push(...stateGrants);

        // Check private grants
        const privateGrants = await this.searchPrivateGrants(businessProfile);
        grants.push(...privateGrants);

        return grants.map(grant => ({
            ...grant,
            eligibility: this.checkGrantEligibility(grant, businessProfile),
            deadline: this.calculateGrantDeadline(grant),
            requiredDocuments: this.getGrantRequirements(grant)
        }));
    }

    private async getCurrentLegalStructure() {
        const structure = await this.fetchLegalStructure();
        return {
            type: structure.type,
            state: structure.state,
            owners: structure.owners,
            responsibilities: this.analyzeLegalResponsibilities(structure),
            risks: this.analyzeLegalRisks(structure),
            taxImplications: this.analyzeTaxStructure(structure)
        };
    }

    // Helper methods for data retrieval
    private async getRevenueData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/revenue`);
            const data = await response.json();
            return {
                total: data.totalRevenue,
                monthly: data.monthlyRevenue,
                streams: data.revenueStreams,
                trends: data.revenueTrends,
                projections: data.revenueProjections
            };
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            throw error;
        }
    }

    private async getExpenseData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/expenses`);
            const data = await response.json();
            return {
                total: data.totalExpenses,
                fixed: data.fixedExpenses,
                variable: data.variableExpenses,
                categories: data.expenseCategories,
                trends: data.expenseTrends
            };
        } catch (error) {
            console.error('Error fetching expense data:', error);
            throw error;
        }
    }

    private async getAssetData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/assets`);
            const data = await response.json();
            return {
                current: data.currentAssets,
                fixed: data.fixedAssets,
                intangible: data.intangibleAssets,
                total: data.totalAssets,
                depreciation: data.assetDepreciation
            };
        } catch (error) {
            console.error('Error fetching asset data:', error);
            throw error;
        }
    }

    private async getLiabilityData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/liabilities`);
            const data = await response.json();
            return {
                current: data.currentLiabilities,
                longTerm: data.longTermLiabilities,
                total: data.totalLiabilities,
                paymentSchedule: data.paymentSchedules,
                interestRates: data.interestRates
            };
        } catch (error) {
            console.error('Error fetching liability data:', error);
            throw error;
        }
    }

    private async getCashFlowData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/cashflow`);
            const data = await response.json();
            return {
                operating: data.operatingCashFlow,
                investing: data.investingCashFlow,
                financing: data.financingCashFlow,
                netCashFlow: data.netCashFlow,
                projections: data.cashFlowProjections
            };
        } catch (error) {
            console.error('Error fetching cash flow data:', error);
            throw error;
        }
    }

    private async getCreditHistory() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/credit`);
            const data = await response.json();
            return {
                paymentHistory: data.paymentHistory,
                creditAccounts: data.creditAccounts,
                inquiries: data.creditInquiries,
                derogatory: data.derogatoryMarks,
                utilization: data.creditUtilization
            };
        } catch (error) {
            console.error('Error fetching credit history:', error);
            throw error;
        }
    }

    // Helper methods for analysis
    private analyzePaymentHistory(history) {
        const latePayments = history.paymentHistory.filter(payment => payment.daysLate > 0);
        const onTimePayments = history.paymentHistory.length - latePayments.length;
        const paymentScore = onTimePayments / history.paymentHistory.length;
        
        return {
            score: paymentScore,
            latePayments: latePayments.length,
            averageDaysLate: this.calculateAverageDaysLate(latePayments),
            trend: this.analyzePaymentTrend(history.paymentHistory)
        };
    }

    private calculateCreditUtilization(data) {
        const totalCredit = data.creditHistory.creditAccounts.reduce((sum, account) => 
            sum + account.creditLimit, 0);
        const usedCredit = data.creditHistory.creditAccounts.reduce((sum, account) => 
            sum + account.currentBalance, 0);
        
        return (usedCredit / totalCredit) * 100;
    }

    private analyzeCreditMix(data) {
        const accounts = data.creditHistory.creditAccounts;
        const types = new Set(accounts.map(account => account.type));
        const typeWeights = {
            'revolvingCredit': 0.3,
            'installmentLoan': 0.25,
            'mortgageLoan': 0.25,
            'businessCredit': 0.2
        };

        return Array.from(types).reduce((score, type) => 
            score + (typeWeights[type] || 0), 0);
    }

    private calculateAccountAges(history) {
        const ages = history.creditAccounts.map(account => {
            const ageInMonths = this.calculateMonthsBetween(
                new Date(account.openDate),
                new Date()
            );
            return ageInMonths;
        });

        return {
            averageAge: ages.reduce((sum, age) => sum + age, 0) / ages.length,
            oldestAccount: Math.max(...ages),
            newestAccount: Math.min(...ages)
        };
    }

    private countRecentInquiries(history) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentInquiries = history.creditInquiries.filter(inquiry => 
            new Date(inquiry.date) > sixMonthsAgo
        );

        return {
            count: recentInquiries.length,
            impact: this.calculateInquiryImpact(recentInquiries.length)
        };
    }

    // Utility methods
    private calculateMonthsBetween(date1, date2) {
        const yearDiff = date2.getFullYear() - date1.getFullYear();
        const monthDiff = date2.getMonth() - date1.getMonth();
        return yearDiff * 12 + monthDiff;
    }

    private calculateAverageDaysLate(latePayments) {
        if (latePayments.length === 0) return 0;
        return latePayments.reduce((sum, payment) => 
            sum + payment.daysLate, 0) / latePayments.length;
    }

    private analyzePaymentTrend(payments) {
        // Sort payments by date
        const sortedPayments = [...payments].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        // Calculate trend
        let trend = 0;
        for (let i = 1; i < sortedPayments.length; i++) {
            const prev = sortedPayments[i - 1].daysLate;
            const curr = sortedPayments[i].daysLate;
            trend += prev - curr;
        }

        return {
            direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
            magnitude: Math.abs(trend / payments.length)
        };
    }

    private calculateInquiryImpact(inquiryCount) {
        // More inquiries = higher impact
        if (inquiryCount <= 2) return 'low';
        if (inquiryCount <= 5) return 'medium';
        return 'high';
    }
}

export default BusinessAnalyzer; 