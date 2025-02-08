class DepartmentManager {
    constructor() {
        this.departments = [];
        this.templates = this.getDefaultTemplates();
        this.loadDepartments();
    }

    getDefaultTemplates() {
        return {
            startup: {
                name: 'Startup Structure',
                departments: [
                    { name: 'Leadership', focusAreas: ['Strategy', 'Decision Making'] },
                    { name: 'Product Development', focusAreas: ['Innovation', 'Design'] },
                    { name: 'Marketing', focusAreas: ['Branding', 'Customer Acquisition'] }
                ]
            },
            corporate: {
                name: 'Corporate Structure',
                departments: [
                    { name: 'Executive', focusAreas: ['Governance', 'Strategy'] },
                    { name: 'Finance', focusAreas: ['Accounting', 'Investments'] },
                    { name: 'HR', focusAreas: ['Recruitment', 'Employee Relations'] }
                ]
            }
        };
    }

    createDepartment(department) {
        department.id = Date.now().toString();
        this.departments.push(department);
        this.saveDepartments();
    }

    updateDepartment(id, updatedData) {
        const index = this.departments.findIndex(dept => dept.id === id);
        if (index !== -1) {
            this.departments[index] = { ...this.departments[index], ...updatedData };
            this.saveDepartments();
        }
    }

    deleteDepartment(id) {
        this.departments = this.departments.filter(dept => dept.id !== id);
        this.saveDepartments();
    }

    applyTemplate(templateName) {
        const template = this.templates[templateName];
        if (template) {
            template.departments.forEach(dept => {
                this.createDepartment({
                    ...dept,
                    parentDepartment: null,
                    employees: [],
                    resources: []
                });
            });
        }
    }

    saveDepartments() {
        localStorage.setItem('departments', JSON.stringify(this.departments));
    }

    loadDepartments() {
        const savedDepartments = localStorage.getItem('departments');
        if (savedDepartments) {
            this.departments = JSON.parse(savedDepartments);
        }
    }
} 