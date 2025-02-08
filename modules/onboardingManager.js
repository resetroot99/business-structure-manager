class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.businessData = {};
        this.steps = [
            'business-verification',
            'data-import',
            'profile-setup',
            'compliance-check',
            'integration-setup'
        ];
    }

    async startOnboarding() {
        this.showOnboardingModal();
        this.renderCurrentStep();
    }

    async verifyFEIN(fein) {
        try {
            // Clean FEIN format
            const cleanFEIN = fein.replace(/[^0-9]/g, '');
            
            // Verify format
            if (cleanFEIN.length !== 9) {
                throw new Error('Invalid FEIN format');
            }

            const response = await fetch('/api/verify-business', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fein: cleanFEIN })
            });

            const data = await response.json();
            if (data.verified) {
                this.businessData = {
                    ...this.businessData,
                    ...data.businessInfo
                };
                return true;
            }
            return false;
        } catch (error) {
            console.error('FEIN verification error:', error);
            throw error;
        }
    }

    async importBusinessData() {
        try {
            const sources = [
                { type: 'irs', endpoint: '/api/import/irs' },
                { type: 'state', endpoint: '/api/import/state' },
                { type: 'credit', endpoint: '/api/import/credit' },
                { type: 'banking', endpoint: '/api/import/banking' }
            ];

            const importPromises = sources.map(async source => {
                const response = await fetch(source.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        businessId: this.businessData.id,
                        fein: this.businessData.fein
                    })
                });
                return response.json();
            });

            const results = await Promise.all(importPromises);
            this.processImportedData(results);
            return true;
        } catch (error) {
            console.error('Data import error:', error);
            throw error;
        }
    }

    private processImportedData(results) {
        results.forEach(result => {
            if (result.success) {
                this.businessData = {
                    ...this.businessData,
                    [result.type]: result.data
                };
            }
        });
    }

    private showOnboardingModal() {
        const modal = document.createElement('div');
        modal.className = 'onboarding-modal';
        modal.innerHTML = `
            <div class="onboarding-content">
                <div class="progress-bar">
                    ${this.steps.map((step, index) => `
                        <div class="step ${index <= this.currentStep ? 'active' : ''}">${step}</div>
                    `).join('')}
                </div>
                <div class="step-content"></div>
                <div class="step-actions">
                    <button class="btn back" ${this.currentStep === 0 ? 'disabled' : ''}>Back</button>
                    <button class="btn next">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.setupModalListeners(modal);
    }

    private renderCurrentStep() {
        const contentDiv = document.querySelector('.step-content');
        switch (this.steps[this.currentStep]) {
            case 'business-verification':
                contentDiv.innerHTML = `
                    <h2>Verify Your Business</h2>
                    <p>Enter your Federal Employer Identification Number (FEIN)</p>
                    <input type="text" id="fein" placeholder="XX-XXXXXXX" maxlength="10">
                    <div class="hint">Format: 12-3456789</div>
                `;
                this.setupFEINValidation();
                break;
            case 'data-import':
                contentDiv.innerHTML = `
                    <h2>Import Business Data</h2>
                    <div class="import-sources">
                        <div class="source">
                            <input type="checkbox" id="irs" checked>
                            <label for="irs">IRS Data</label>
                        </div>
                        <div class="source">
                            <input type="checkbox" id="state" checked>
                            <label for="state">State Records</label>
                        </div>
                        <div class="source">
                            <input type="checkbox" id="credit" checked>
                            <label for="credit">Credit Reports</label>
                        </div>
                        <div class="source">
                            <input type="checkbox" id="banking" checked>
                            <label for="banking">Banking Data</label>
                        </div>
                    </div>
                `;
                break;
            case 'profile-setup':
                contentDiv.innerHTML = `
                    <h2>Business Profile Setup</h2>
                    <div class="profile-form">
                        <div class="form-group">
                            <label>Business Name</label>
                            <input type="text" id="businessName" value="${this.businessData.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Industry</label>
                            <select id="industry" required>
                                ${this.getIndustryOptions()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Business Structure</label>
                            <select id="structure" required>
                                <option value="llc">LLC</option>
                                <option value="corporation">Corporation</option>
                                <option value="partnership">Partnership</option>
                                <option value="sole-proprietorship">Sole Proprietorship</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Number of Employees</label>
                            <input type="number" id="employeeCount" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Annual Revenue Range</label>
                            <select id="revenueRange" required>
                                <option value="0-100k">$0 - $100,000</option>
                                <option value="100k-500k">$100,000 - $500,000</option>
                                <option value="500k-1m">$500,000 - $1,000,000</option>
                                <option value="1m-5m">$1,000,000 - $5,000,000</option>
                                <option value="5m+">$5,000,000+</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
            case 'compliance-check':
                contentDiv.innerHTML = `
                    <h2>Compliance Check</h2>
                    <div class="compliance-checklist">
                        ${this.renderComplianceChecklist()}
                    </div>
                    <div class="missing-requirements">
                        ${this.renderMissingRequirements()}
                    </div>
                `;
                break;
            case 'integration-setup':
                contentDiv.innerHTML = `
                    <h2>Setup Integrations</h2>
                    <div class="integration-options">
                        <div class="integration-group">
                            <h3>Financial Integrations</h3>
                            ${this.renderFinancialIntegrations()}
                        </div>
                        <div class="integration-group">
                            <h3>Document Management</h3>
                            ${this.renderDocumentIntegrations()}
                        </div>
                        <div class="integration-group">
                            <h3>Communication Tools</h3>
                            ${this.renderCommunicationIntegrations()}
                        </div>
                    </div>
                `;
                break;
        }
    }

    private setupModalListeners(modal) {
        const backBtn = modal.querySelector('.back');
        const nextBtn = modal.querySelector('.next');

        backBtn.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.renderCurrentStep();
                this.updateProgressBar();
            }
        });

        nextBtn.addEventListener('click', async () => {
            if (await this.validateCurrentStep()) {
                if (this.currentStep < this.steps.length - 1) {
                    this.currentStep++;
                    this.renderCurrentStep();
                    this.updateProgressBar();
                } else {
                    this.completeOnboarding();
                }
            }
        });
    }

    private async validateCurrentStep() {
        switch (this.steps[this.currentStep]) {
            case 'business-verification':
                const fein = document.getElementById('fein').value;
                return await this.verifyFEIN(fein);
            case 'data-import':
                return await this.importBusinessData();
            case 'profile-setup':
                return this.validateAndSaveProfile();
            case 'compliance-check':
                return this.validateCompliance();
            case 'integration-setup':
                return this.setupIntegrations();
            default:
                return true;
        }
    }

    private updateProgressBar() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index <= this.currentStep);
        });
    }

    private async completeOnboarding() {
        try {
            // Save all collected data
            await this.saveBusinessProfile();
            
            // Initialize all necessary modules
            await this.initializeModules();
            
            // Remove onboarding modal
            document.querySelector('.onboarding-modal').remove();
            
            // Show success message
            this.showSuccessMessage();
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error completing onboarding:', error);
            this.showError(error);
        }
    }

    private async saveBusinessProfile() {
        try {
            const response = await fetch('/api/business/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.businessData)
            });

            if (!response.ok) {
                throw new Error('Failed to save business profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving business profile:', error);
            throw error;
        }
    }

    private async initializeModules() {
        try {
            // Initialize core modules
            const modules = [
                new BusinessAnalyzer(this.businessData.id),
                new ComplianceManager(this.businessData.id),
                new DocumentManager(this.businessData.id),
                new TaxManager(this.businessData.id),
                new StrategicAdvisor(this.businessData.id)
            ];

            // Initialize each module with business data
            await Promise.all(modules.map(module => module.initialize(this.businessData)));

            // Set up dashboard
            const dashboard = new Dashboard(this.businessData.id);
            await dashboard.initialize(modules);

            return true;
        } catch (error) {
            console.error('Error initializing modules:', error);
            throw error;
        }
    }

    // Helper methods
    private getIndustryOptions() {
        const industries = [
            'Technology', 'Retail', 'Manufacturing', 'Healthcare',
            'Financial Services', 'Construction', 'Professional Services',
            'Food & Beverage', 'Real Estate', 'Other'
        ];
        return industries.map(industry => 
            `<option value="${industry.toLowerCase()}">${industry}</option>`
        ).join('');
    }

    private renderComplianceChecklist() {
        const requirements = [
            { id: 'business-license', name: 'Business License', required: true },
            { id: 'tax-registration', name: 'Tax Registration', required: true },
            { id: 'permits', name: 'Required Permits', required: true },
            { id: 'insurance', name: 'Business Insurance', required: true },
            { id: 'ein', name: 'EIN Documentation', required: true },
            { id: 'zoning', name: 'Zoning Compliance', required: true },
            { id: 'workers-comp', name: 'Workers Compensation', required: this.businessData.profile?.employeeCount > 0 },
            { id: 'professional-license', name: 'Professional License', required: this.requiresProfessionalLicense() }
        ];

        return `
            <div class="checklist">
                ${requirements.map(req => `
                    <div class="checklist-item">
                        <input type="checkbox" id="${req.id}" 
                            ${this.businessData.compliance?.[req.id] ? 'checked' : ''}
                            ${req.required ? 'required' : ''}>
                        <label for="${req.id}">
                            ${req.name}
                            ${req.required ? '<span class="required">*</span>' : ''}
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderMissingRequirements() {
        const missing = this.getMissingRequirements();
        if (missing.length === 0) return '<p class="success">All required documents are in order.</p>';

        return `
            <div class="missing-requirements">
                <h4>Missing Requirements:</h4>
                <ul>
                    ${missing.map(req => `
                        <li>
                            <span class="requirement-name">${req.name}</span>
                            <span class="requirement-action">${req.action}</span>
                            ${req.deadline ? `<span class="deadline">Due by: ${req.deadline}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    private renderFinancialIntegrations() {
        const integrations = [
            { id: 'quickbooks', name: 'QuickBooks', icon: 'quickbooks-icon.png' },
            { id: 'xero', name: 'Xero', icon: 'xero-icon.png' },
            { id: 'stripe', name: 'Stripe', icon: 'stripe-icon.png' },
            { id: 'square', name: 'Square', icon: 'square-icon.png' },
            { id: 'plaid', name: 'Plaid', icon: 'plaid-icon.png' }
        ];

        return this.renderIntegrationGroup(integrations);
    }

    private renderDocumentIntegrations() {
        const integrations = [
            { id: 'dropbox', name: 'Dropbox', icon: 'dropbox-icon.png' },
            { id: 'gdrive', name: 'Google Drive', icon: 'gdrive-icon.png' },
            { id: 'onedrive', name: 'OneDrive', icon: 'onedrive-icon.png' },
            { id: 'box', name: 'Box', icon: 'box-icon.png' }
        ];

        return this.renderIntegrationGroup(integrations);
    }

    private renderCommunicationIntegrations() {
        const integrations = [
            { id: 'slack', name: 'Slack', icon: 'slack-icon.png' },
            { id: 'teams', name: 'Microsoft Teams', icon: 'teams-icon.png' },
            { id: 'zoom', name: 'Zoom', icon: 'zoom-icon.png' }
        ];

        return this.renderIntegrationGroup(integrations);
    }

    private renderIntegrationGroup(integrations) {
        return `
            <div class="integration-list">
                ${integrations.map(integration => `
                    <div class="integration-item">
                        <img src="/assets/icons/${integration.icon}" alt="${integration.name}">
                        <span class="integration-name">${integration.name}</span>
                        <button class="btn connect-btn" 
                            data-integration="${integration.id}"
                            onclick="onboardingManager.connectIntegration('${integration.id}')">
                            Connect
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    private async connectIntegration(integrationId) {
        try {
            const integration = await this.initializeIntegration(integrationId);
            if (integration.requiresAuth) {
                this.showAuthModal(integration);
            } else {
                await this.completeIntegrationSetup(integration);
            }
        } catch (error) {
            this.showError(error);
        }
    }

    private async initializeIntegration(integrationId) {
        const response = await fetch(`/api/integrations/${integrationId}/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                businessId: this.businessData.id
            })
        });
        return response.json();
    }

    private showAuthModal(integration) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-content">
                <h3>Connect to ${integration.name}</h3>
                <p>${integration.description}</p>
                <div class="auth-buttons">
                    <button class="btn authorize" onclick="window.location.href='${integration.authUrl}'">
                        Authorize
                    </button>
                    <button class="btn cancel" onclick="this.closest('.auth-modal').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    private async completeIntegrationSetup(integration) {
        const button = document.querySelector(`[data-integration="${integration.id}"]`);
        button.textContent = 'Connected';
        button.classList.add('connected');
        
        this.businessData.integrations = {
            ...this.businessData.integrations,
            [integration.id]: {
                status: 'connected',
                connectedAt: new Date(),
                settings: integration.settings
            }
        };
    }

    private validateProfileData(profile) {
        return Object.values(profile).every(value => 
            value !== null && value !== undefined && value !== ''
        );
    }

    private async validateCompliance() {
        try {
            const complianceStatus = await this.checkComplianceStatus();
            this.businessData.compliance = complianceStatus;

            if (complianceStatus.criticalIssues.length > 0) {
                this.showComplianceWarning(complianceStatus.criticalIssues);
                return false;
            }

            return true;
        } catch (error) {
            this.showError(error);
            return false;
        }
    }

    private async setupIntegrations() {
        try {
            const selectedIntegrations = this.getSelectedIntegrations();
            const setupResults = await this.initializeIntegrations(selectedIntegrations);

            this.businessData.integrations = setupResults;
            return true;
        } catch (error) {
            this.showError(error);
            return false;
        }
    }

    private getMissingRequirements() {
        // Implementation based on compliance check results
        return this.businessData.compliance?.missingRequirements || [];
    }

    private requiresProfessionalLicense() {
        const professionalIndustries = [
            'healthcare',
            'legal',
            'financial-services',
            'construction',
            'real-estate'
        ];
        return professionalIndustries.includes(this.businessData.profile?.industry);
    }

    private showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h4>Error</h4>
                <p>${error.message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    private showComplianceWarning(issues) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'compliance-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h4>Compliance Issues Detected</h4>
                <ul>
                    ${issues.map(issue => `
                        <li>
                            <strong>${issue.name}:</strong> ${issue.description}
                            <br>
                            <small>Required Action: ${issue.action}</small>
                        </li>
                    `).join('')}
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Acknowledge</button>
            </div>
        `;
        document.body.appendChild(warningDiv);
    }
}

export const onboardingManager = new OnboardingManager(); 