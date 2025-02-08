class DepartmentManager {
    constructor() {
        this.departments = [];
        this.loadDepartments();
        this.initializeEventListeners();
    }

    loadDepartments() {
        const stored = localStorage.getItem('departments');
        this.departments = stored ? JSON.parse(stored) : [];
        this.renderDepartments();
    }

    saveDepartments() {
        localStorage.setItem('departments', JSON.stringify(this.departments));
    }

    addDepartment(department) {
        department.id = Date.now().toString();
        this.departments.push(department);
        this.saveDepartments();
        this.renderDepartments();
    }

    updateDepartment(id, updatedDepartment) {
        const index = this.departments.findIndex(dept => dept.id === id);
        if (index !== -1) {
            this.departments[index] = { ...this.departments[index], ...updatedDepartment };
            this.saveDepartments();
            this.renderDepartments();
        }
    }

    deleteDepartment(id) {
        this.departments = this.departments.filter(dept => dept.id !== id);
        this.saveDepartments();
        this.renderDepartments();
    }

    renderDepartments() {
        const departmentsList = document.getElementById('departmentsList');
        departmentsList.innerHTML = '';

        this.departments.forEach(dept => {
            const card = this.createDepartmentCard(dept);
            departmentsList.appendChild(card);
        });

        this.updateParentDepartmentOptions();
        this.renderHierarchy();
    }

    createDepartmentCard(dept) {
        const card = document.createElement('div');
        card.className = 'department-card';
        card.innerHTML = `
            <h3>${dept.name}</h3>
            <p>${dept.description || 'No description'}</p>
            <p><strong>Parent:</strong> ${this.getParentName(dept.parentDept) || 'None'}</p>
            <div class="actions">
                <button class="btn primary edit-btn" data-id="${dept.id}">Edit</button>
                <button class="btn secondary delete-btn" data-id="${dept.id}">Delete</button>
            </div>
        `;

        return card;
    }

    getParentName(parentId) {
        if (!parentId) return null;
        const parent = this.departments.find(dept => dept.id === parentId);
        return parent ? parent.name : null;
    }

    updateParentDepartmentOptions() {
        const parentSelect = document.getElementById('parentDept');
        parentSelect.innerHTML = '<option value="">None</option>';
        
        this.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            parentSelect.appendChild(option);
        });
    }

    initializeEventListeners() {
        const addBtn = document.getElementById('addDepartmentBtn');
        const form = document.getElementById('newDepartmentForm');
        const cancelBtn = document.getElementById('cancelBtn');

        addBtn.addEventListener('click', () => {
            document.getElementById('departmentForm').classList.remove('hidden');
        });

        cancelBtn.addEventListener('click', () => {
            document.getElementById('departmentForm').classList.add('hidden');
            form.reset();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDepartment = {
                name: document.getElementById('deptName').value,
                description: document.getElementById('deptDescription').value,
                parentDept: document.getElementById('parentDept').value || null
            };
            this.addDepartment(newDepartment);
            form.reset();
            document.getElementById('departmentForm').classList.add('hidden');
        });

        document.getElementById('departmentsList').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this department?')) {
                    this.deleteDepartment(id);
                }
            }
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                this.openEditForm(id);
            }
        });

        document.getElementById('editDepartmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('editDeptId').value;
            const updatedDepartment = {
                name: document.getElementById('editDeptName').value,
                description: document.getElementById('editDeptDescription').value,
                parentDept: document.getElementById('editParentDept').value || null
            };
            this.updateDepartment(id, updatedDepartment);
            document.getElementById('editDepartmentForm').reset();
            document.getElementById('editDepartmentForm').classList.add('hidden');
        });
    }

    openEditForm(id) {
        const department = this.departments.find(dept => dept.id === id);
        if (department) {
            document.getElementById('editDeptId').value = department.id;
            document.getElementById('editDeptName').value = department.name;
            document.getElementById('editDeptDescription').value = department.description || '';
            document.getElementById('editParentDept').value = department.parentDept || '';
            document.getElementById('editDepartmentForm').classList.remove('hidden');
        }
    }

    renderHierarchy() {
        const width = 1200;
        const height = 500;
        const margin = { top: 20, right: 120, bottom: 20, left: 120 };

        // Clear existing chart
        d3.select('#hierarchyChart').selectAll('*').remove();

        const svg = d3.select('#hierarchyChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(d3.zoom().on('zoom', (event) => {
                svg.attr('transform', event.transform);
            }))
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create hierarchy data
        const root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.parentDept)
            (this.departments);

        const treeLayout = d3.tree().size([height - 100, width - 200]);

        const treeData = treeLayout(root);

        // Tooltip setup
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        // Color scale for hierarchy levels
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw links
        svg.selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
            );

        // Draw nodes
        const nodes = svg.selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .on('click', (event, d) => {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                this.renderHierarchy();
            })
            .on('mouseover', (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html(`
                    <strong>${d.data.name}</strong><br>
                    ${d.data.description || 'No description'}
                `)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

        nodes.append('circle')
            .attr('r', 10)
            .style('fill', d => color(d.depth));

        nodes.append('text')
            .attr('dy', '.35em')
            .attr('x', d => d.children ? -15 : 15)
            .style('text-anchor', d => d.children ? 'end' : 'start')
            .style('fill', d => color(d.depth))
            .text(d => d.data.name);
    }
}

class AppState {
    constructor() {
        this.businessProfile = {};
        this.departments = [];
        this.employees = [];
        this.analytics = {};
    }
    
    // ... state management methods ...
}

class App {
    constructor() {
        this.credentialManager = new CredentialManager();
        this.businessId = null;
        this.modules = new Map();
    }

    async initialize() {
        try {
            await this.setupAuthentication();
            this.initializeModules();
            this.setupEventListeners();
            this.startDataSync();
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    async setupAuthentication() {
        // Handle authentication
        const authenticated = await this.credentialManager.verifyCredentials();
        if (!authenticated) {
            this.showLoginModal();
        }
    }

    initializeModules() {
        // Initialize all modules with proper dependencies
        this.modules.set('dashboard', new Dashboard(this.businessId));
        this.modules.set('canvas', new CanvasManager());
        this.modules.set('documents', new DocumentManager(this.businessId));
        this.modules.set('compliance', new ComplianceManager(this.businessId));
        this.modules.set('tax', new TaxManager(this.businessId));
        this.modules.set('token', tokenManager);
    }

    setupEventListeners() {
        // Set up global event listeners
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    startDataSync() {
        // Start periodic data synchronization
        setInterval(() => {
            this.syncData();
        }, 30000); // Sync every 30 seconds
    }

    async syncData() {
        // Synchronize data across modules
        for (const [name, module] of this.modules) {
            if (module.sync) {
                await module.sync();
            }
        }
    }

    handleError(error) {
        console.error('Application error:', error);
        // Implement error handling and user notification
    }

    showLoginModal() {
        // Implement login modal
    }
}

// Initialize app
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.initialize());

const businessChart = new BusinessChart('businessChart');
const businessAI = new BusinessAI();

async function handleChatPrompt() {
    const input = document.getElementById('chatInput').value;
    const response = await businessAI.chatPrompt(input);
    if (response.success) {
        businessChart.addBusiness(response.business);
    }
}

const canvasManager = new CanvasManager('businessCanvas');
const businessManager = new BusinessManager();
const dashboard = new Dashboard('business1');

function loadBusinessData() {
    canvasManager.loadBusinessData();
}

function saveBusinessData() {
    canvasManager.saveBusinessData();
}

// Initialize dashboard
document.getElementById('upcomingTaxes').textContent = dashboard.renderOverview().upcomingTaxes.length;
document.getElementById('totalRebates').textContent = `$${dashboard.renderOverview().totalRebates}`;
document.getElementById('reminders').textContent = dashboard.renderOverview().reminders.length; 