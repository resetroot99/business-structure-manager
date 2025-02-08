class EmployeeManager {
    constructor() {
        this.employees = [];
        this.roles = [];
        this.skills = [];
        this.loadData();
    }

    addEmployee(employee) {
        employee.id = Date.now().toString();
        this.employees.push(employee);
        this.saveData();
    }

    updateEmployee(id, updatedData) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...updatedData };
            this.saveData();
        }
    }

    deleteEmployee(id) {
        this.employees = this.employees.filter(emp => emp.id !== id);
        this.saveData();
    }

    addRole(role) {
        this.roles.push(role);
        this.saveData();
    }

    addSkill(skill) {
        this.skills.push(skill);
        this.saveData();
    }

    assignDepartment(employeeId, departmentId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (employee) {
            employee.departmentId = departmentId;
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
        localStorage.setItem('roles', JSON.stringify(this.roles));
        localStorage.setItem('skills', JSON.stringify(this.skills));
    }

    loadData() {
        const savedEmployees = localStorage.getItem('employees');
        const savedRoles = localStorage.getItem('roles');
        const savedSkills = localStorage.getItem('skills');
        
        if (savedEmployees) this.employees = JSON.parse(savedEmployees);
        if (savedRoles) this.roles = JSON.parse(savedRoles);
        if (savedSkills) this.skills = JSON.parse(savedSkills);
    }
} 