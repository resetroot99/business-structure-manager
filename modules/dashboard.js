import { WebSocketClient } from '../utils/websocket';

class Dashboard {
    constructor(businessId) {
        this.businessId = businessId;
        this.modules = new Map();
        this.initialized = false;
        this.wsClient = new WebSocketClient();
        this.setupEventListeners();
        this.setupWebSocket();
    }

    async initialize(modules = []) {
        try {
            // Check if onboarding is completed
            const onboardingStatus = await this.checkOnboardingStatus();
            if (!onboardingStatus.completed) {
                this.startOnboarding();
                return;
            }

            // Initialize modules
            await this.initializeModules(modules);
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Render dashboard
            this.render();
            
            this.initialized = true;
            
            // Start periodic updates
            this.startPeriodicUpdates();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.handleError(error);
        }
    }

    private async checkOnboardingStatus() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/onboarding-status`);
            return await response.json();
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return { completed: false };
        }
    }

    private startOnboarding() {
        const onboardingManager = new OnboardingManager();
        onboardingManager.startOnboarding().then(() => {
            this.initialize(); // Reinitialize dashboard after onboarding
        });
    }

    private async loadDashboardData() {
        const dataPromises = [
            this.loadFinancialData(),
            this.loadComplianceData(),
            this.loadTaxData(),
            this.loadDocumentData()
        ];

        const [financial, compliance, tax, documents] = await Promise.all(dataPromises);

        this.dashboardData = {
            financial,
            compliance,
            tax,
            documents,
            lastUpdated: new Date()
        };
    }

    private startPeriodicUpdates() {
        setInterval(() => {
            this.updateDashboard();
        }, 300000); // Update every 5 minutes
    }

    private async updateDashboard() {
        try {
            await this.loadDashboardData();
            this.render();
        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }

    async generateInsights() {
        const insights = {
            urgentActions: await this.getUrgentActions(),
            opportunities: await this.getOpportunities(),
            risks: await this.getRisks(),
            compliance: await this.getComplianceStatus(),
            financials: await this.getFinancialHealth()
        };

        this.renderDashboard(insights);
    }

    async getUrgentActions() {
        return {
            expiringLicenses: await this.compliance.getExpiringLicenses(),
            upcomingDeadlines: await this.compliance.getUpcomingDeadlines(),
            criticalPayments: await this.getUpcomingPayments(),
            requiredFilings: await this.getRequiredFilings()
        };
    }

    async getOpportunities() {
        return {
            funding: await this.analyzer.findFundingOpportunities(),
            taxSavings: await this.advisor.findTaxSavingOpportunities(),
            growthAreas: await this.advisor.analyzeGrowthPotential(),
            costSavings: await this.advisor.identifyCostReductionAreas()
        };
    }

    renderOverview() {
        return {
            upcomingTaxes: this.taxManager.getUpcomingTaxes(),
            totalRebates: this.rebateManager.getTotalRebates(),
            totalExpenses: this.rebateManager.getTotalExpenses(),
            reminders: this.complianceManager.getReminders()
        };
    }

    render() {
        if (!this.initialized) return;

        this.renderOverview();
        this.renderFinancialSection();
        this.renderComplianceSection();
        this.renderTaxSection();
        this.renderDocumentSection();
        this.renderActionItems();
    }

    private renderOverview() {
        const overview = document.getElementById('dashboard-overview');
        overview.innerHTML = `
            <div class="overview-grid">
                ${this.renderMetricCards()}
                ${this.renderAlertCards()}
                ${this.renderActionCards()}
            </div>
        `;
    }

    private renderMetricCards() {
        const { financial, compliance, tax } = this.dashboardData;
        return `
            <div class="metric-card">
                <h3>Financial Health</h3>
                <div class="metric">${financial.metrics.grossMargin.toFixed(2)}%</div>
                <div class="label">Gross Margin</div>
            </div>
            <div class="metric-card">
                <h3>Compliance Status</h3>
                <div class="metric ${compliance.status.status}">${compliance.status.status}</div>
                <div class="label">${compliance.status.issueCount} issues</div>
            </div>
            <div class="metric-card">
                <h3>Tax Status</h3>
                <div class="metric">$${tax.summary.totalDue.toLocaleString()}</div>
                <div class="label">Due in next 30 days</div>
            </div>
        `;
    }

    private setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupActionListeners();
            this.setupFilterListeners();
            this.setupSearchListeners();
        });
    }

    private handleError(error) {
        console.error('Dashboard error:', error);
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <h4>Error</h4>
                <p>${error.message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    private async initializeModules(modules) {
        // Initialize core modules
        this.modules.set('business', new BusinessAnalyzer(this.businessId));
        this.modules.set('compliance', new ComplianceManager(this.businessId));
        this.modules.set('tax', new TaxManager(this.businessId));
        this.modules.set('documents', new DocumentManager(this.businessId));
        this.modules.set('strategy', new StrategicAdvisor(this.modules.get('business')));

        // Initialize additional modules
        modules.forEach(module => {
            this.modules.set(module.name, module);
        });

        // Initialize each module
        for (const [name, module] of this.modules) {
            await module.initialize();
        }
    }

    private async loadFinancialData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/financial-data`);
            const data = await response.json();
            return {
                revenue: data.revenue,
                expenses: data.expenses,
                cashFlow: data.cashFlow,
                projections: data.projections,
                metrics: this.calculateFinancialMetrics(data)
            };
        } catch (error) {
            console.error('Error loading financial data:', error);
            throw error;
        }
    }

    private async loadComplianceData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/compliance-data`);
            const data = await response.json();
            return {
                licenses: data.licenses,
                permits: data.permits,
                deadlines: data.deadlines,
                requirements: data.requirements,
                status: this.calculateComplianceStatus(data)
            };
        } catch (error) {
            console.error('Error loading compliance data:', error);
            throw error;
        }
    }

    private async loadTaxData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/tax-data`);
            const data = await response.json();
            return {
                filings: data.filings,
                payments: data.payments,
                deadlines: data.deadlines,
                optimizations: data.optimizations,
                summary: this.calculateTaxSummary(data)
            };
        } catch (error) {
            console.error('Error loading tax data:', error);
            throw error;
        }
    }

    private async loadDocumentData() {
        try {
            const response = await fetch(`/api/business/${this.businessId}/document-data`);
            const data = await response.json();
            return {
                recent: data.recentDocuments,
                expiring: data.expiringDocuments,
                required: data.requiredDocuments,
                missing: data.missingDocuments
            };
        } catch (error) {
            console.error('Error loading document data:', error);
            throw error;
        }
    }

    private calculateFinancialMetrics(data) {
        return {
            grossMargin: ((data.revenue - data.expenses) / data.revenue) * 100,
            currentRatio: data.assets.current / data.liabilities.current,
            quickRatio: (data.assets.current - data.inventory) / data.liabilities.current,
            cashRatio: data.cash / data.liabilities.current,
            burnRate: this.calculateBurnRate(data)
        };
    }

    private calculateComplianceStatus(data) {
        const issues = data.requirements.filter(req => !req.met);
        const critical = issues.filter(issue => issue.priority === 'critical');
        
        return {
            status: critical.length > 0 ? 'critical' : issues.length > 0 ? 'warning' : 'good',
            issueCount: issues.length,
            criticalCount: critical.length,
            nextDeadline: this.getNextDeadline(data.deadlines)
        };
    }

    private calculateTaxSummary(data) {
        return {
            totalDue: data.payments.reduce((sum, payment) => sum + payment.amount, 0),
            nextDueDate: this.getNextDueDate(data.deadlines),
            potentialSavings: this.calculatePotentialSavings(data.optimizations),
            filingStatus: this.getFilingStatus(data.filings)
        };
    }

    private setupWebSocket() {
        this.wsClient.connect(`ws://api.example.com/ws/${this.businessId}`);
        
        this.wsClient.on('financial_update', (data) => {
            this.handleFinancialUpdate(data);
        });

        this.wsClient.on('compliance_update', (data) => {
            this.handleComplianceUpdate(data);
        });

        this.wsClient.on('tax_update', (data) => {
            this.handleTaxUpdate(data);
        });

        this.wsClient.on('document_update', (data) => {
            this.handleDocumentUpdate(data);
        });
    }

    private async renderFinancialSection() {
        const financialSection = document.getElementById('financial-section');
        const { financial } = this.dashboardData;
        
        financialSection.innerHTML = `
            <div class="section-header">
                <h2>Financial Overview</h2>
                <div class="last-updated">Last updated: ${this.formatDate(financial.lastUpdated)}</div>
            </div>
            <div class="financial-metrics">
                ${this.renderFinancialMetrics(financial.metrics)}
            </div>
            <div class="financial-charts">
                ${this.renderFinancialCharts(financial)}
            </div>
            <div class="financial-alerts">
                ${this.renderFinancialAlerts(financial)}
            </div>
        `;
    }

    private async renderComplianceSection() {
        const complianceSection = document.getElementById('compliance-section');
        const { compliance } = this.dashboardData;

        complianceSection.innerHTML = `
            <div class="section-header">
                <h2>Compliance Status</h2>
                <div class="status-indicator ${compliance.status.status}">
                    ${compliance.status.status.toUpperCase()}
                </div>
            </div>
            <div class="compliance-requirements">
                ${this.renderComplianceRequirements(compliance.requirements)}
            </div>
            <div class="compliance-deadlines">
                ${this.renderComplianceDeadlines(compliance.deadlines)}
            </div>
        `;
    }

    private async renderTaxSection() {
        const taxSection = document.getElementById('tax-section');
        const { tax } = this.dashboardData;

        taxSection.innerHTML = `
            <div class="section-header">
                <h2>Tax Management</h2>
            </div>
            <div class="tax-summary">
                ${this.renderTaxSummary(tax.summary)}
            </div>
            <div class="tax-deadlines">
                ${this.renderTaxDeadlines(tax.deadlines)}
            </div>
            <div class="tax-optimizations">
                ${this.renderTaxOptimizations(tax.optimizations)}
            </div>
        `;
    }

    private async renderDocumentSection() {
        const documentSection = document.getElementById('document-section');
        const { documents } = this.dashboardData;

        documentSection.innerHTML = `
            <div class="section-header">
                <h2>Document Management</h2>
            </div>
            <div class="document-grid">
                <div class="recent-documents">
                    <h3>Recent Documents</h3>
                    ${this.renderDocumentList(documents.recent)}
                </div>
                <div class="expiring-documents">
                    <h3>Expiring Soon</h3>
                    ${this.renderDocumentList(documents.expiring)}
                </div>
                <div class="missing-documents">
                    <h3>Missing Documents</h3>
                    ${this.renderDocumentList(documents.missing)}
                </div>
            </div>
        `;
    }

    private renderActionItems() {
        const actionSection = document.getElementById('action-items');
        const urgentActions = this.getUrgentActions();
        
        actionSection.innerHTML = `
            <div class="section-header">
                <h2>Action Items</h2>
            </div>
            <div class="action-grid">
                ${urgentActions.map(action => `
                    <div class="action-item ${action.priority}">
                        <div class="action-header">
                            <span class="action-type">${action.type}</span>
                            <span class="action-deadline">${this.formatDeadline(action.deadline)}</span>
                        </div>
                        <div class="action-description">${action.description}</div>
                        <button class="btn action-btn" onclick="handleAction('${action.id}')">
                            Take Action
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    private setupActionListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn')) {
                const actionId = e.target.getAttribute('data-action-id');
                this.handleActionClick(actionId);
            }
        });
    }

    private setupFilterListeners() {
        const filters = document.querySelectorAll('.dashboard-filter');
        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    private setupSearchListeners() {
        const searchInput = document.querySelector('.dashboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.handleSearch(searchInput.value);
            }, 300));
        }
    }

    private handleActionClick(actionId) {
        const action = this.findActionById(actionId);
        if (action) {
            this.showActionModal(action);
        }
    }

    private showActionModal(action) {
        const modal = document.createElement('div');
        modal.className = 'action-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${action.title}</h3>
                <div class="action-details">
                    ${this.renderActionDetails(action)}
                </div>
                <div class="modal-actions">
                    <button class="btn primary" onclick="completeAction('${action.id}')">
                        Complete Action
                    </button>
                    <button class="btn secondary" onclick="this.closest('.action-modal').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Utility methods
    private formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private formatDeadline(deadline) {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 7) return `${days} days`;
        return this.formatDate(date);
    }

    private debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    private handleFinancialUpdate(data) {
        try {
            // Update financial data in memory
            this.dashboardData.financial = {
                ...this.dashboardData.financial,
                ...data,
                lastUpdated: new Date()
            };

            // Recalculate metrics
            this.dashboardData.financial.metrics = this.calculateFinancialMetrics(this.dashboardData.financial);

            // Update UI
            this.renderFinancialSection();
            this.checkForAlerts(data);
        } catch (error) {
            console.error('Error handling financial update:', error);
        }
    }

    private handleComplianceUpdate(data) {
        try {
            // Update compliance data
            this.dashboardData.compliance = {
                ...this.dashboardData.compliance,
                ...data,
                status: this.calculateComplianceStatus(data)
            };

            // Update UI
            this.renderComplianceSection();
            
            // Check for urgent compliance issues
            if (data.criticalIssues?.length > 0) {
                this.showComplianceAlert(data.criticalIssues);
            }
        } catch (error) {
            console.error('Error handling compliance update:', error);
        }
    }

    private handleTaxUpdate(data) {
        try {
            // Update tax data
            this.dashboardData.tax = {
                ...this.dashboardData.tax,
                ...data,
                summary: this.calculateTaxSummary(data)
            };

            // Update UI
            this.renderTaxSection();
            
            // Check for urgent tax deadlines
            this.checkTaxDeadlines(data);
        } catch (error) {
            console.error('Error handling tax update:', error);
        }
    }

    private handleDocumentUpdate(data) {
        try {
            // Update document data
            this.dashboardData.documents = {
                ...this.dashboardData.documents,
                ...data
            };

            // Update UI
            this.renderDocumentSection();
            
            // Check for document alerts
            if (data.expiringDocuments?.length > 0) {
                this.showDocumentAlert(data.expiringDocuments);
            }
        } catch (error) {
            console.error('Error handling document update:', error);
        }
    }

    private checkForAlerts(data) {
        // Check for significant changes in financial metrics
        const thresholds = {
            cashFlow: -1000,
            profitMargin: -5,
            debtRatio: 0.8
        };

        if (data.cashFlow < thresholds.cashFlow) {
            this.showAlert('warning', 'Cash Flow Alert', 'Negative cash flow detected');
        }

        if (data.profitMargin < thresholds.profitMargin) {
            this.showAlert('warning', 'Profit Margin Alert', 'Profit margin below threshold');
        }

        if (data.debtRatio > thresholds.debtRatio) {
            this.showAlert('warning', 'Debt Ratio Alert', 'High debt ratio detected');
        }
    }

    private showAlert(type, title, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(alert);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

export default Dashboard; 