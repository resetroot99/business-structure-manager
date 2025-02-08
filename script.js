document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('structure-container');
    const addDepartmentBtn = document.getElementById('addDepartment');
    const addEmployeeBtn = document.getElementById('addEmployee');

    let departments = JSON.parse(localStorage.getItem('departments')) || [];

    function saveDepartments() {
        localStorage.setItem('departments', JSON.stringify(departments));
    }

    function renderStructure() {
        container.innerHTML = '';
        departments.forEach((dept, deptIndex) => {
            const deptElement = document.createElement('div');
            deptElement.className = 'department';
            deptElement.innerHTML = `
                <div class="department-header">
                    <h3>${dept.name}</h3>
                    <button class="delete-btn" onclick="deleteDepartment(${deptIndex})">Delete</button>
                </div>
                <div class="employees">
                    ${dept.employees.map((emp, empIndex) => `
                        <div class="employee">
                            <span>${emp.name} - ${emp.role}</span>
                            <button class="delete-btn" onclick="deleteEmployee(${deptIndex}, ${empIndex})">Delete</button>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(deptElement);
        });
    }

    window.deleteDepartment = function(index) {
        departments.splice(index, 1);
        saveDepartments();
        renderStructure();
    };

    window.deleteEmployee = function(deptIndex, empIndex) {
        departments[deptIndex].employees.splice(empIndex, 1);
        saveDepartments();
        renderStructure();
    };

    addDepartmentBtn.addEventListener('click', () => {
        const name = prompt('Enter department name:');
        if (name) {
            departments.push({
                name: name,
                employees: []
            });
            saveDepartments();
            renderStructure();
        }
    });

    addEmployeeBtn.addEventListener('click', () => {
        if (departments.length === 0) {
            alert('Please create a department first!');
            return;
        }

        const deptIndex = prompt(`Enter department number (1-${departments.length}):`);
        if (!deptIndex || deptIndex < 1 || deptIndex > departments.length) {
            alert('Invalid department number!');
            return;
        }

        const name = prompt('Enter employee name:');
        const role = prompt('Enter employee role:');
        
        if (name && role) {
            departments[deptIndex - 1].employees.push({
                name: name,
                role: role
            });
            saveDepartments();
            renderStructure();
        }
    });

    // Initial render
    renderStructure();
}); 