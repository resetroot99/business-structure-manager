class DataManager {
    constructor() {
        this.encryptionKey = 'default-key'; // In real app, use secure key management
    }
    
    exportData(format = 'json') {
        const data = {
            profile: JSON.parse(localStorage.getItem('businessProfile')),
            departments: JSON.parse(localStorage.getItem('departments')),
            employees: JSON.parse(localStorage.getItem('employees')),
            roles: JSON.parse(localStorage.getItem('roles')),
            skills: JSON.parse(localStorage.getItem('skills'))
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data);
            case 'csv':
                return this.convertToCSV(data);
            default:
                throw new Error('Unsupported format');
        }
    }
    
    importData(data, format = 'json') {
        let parsedData;
        try {
            switch (format) {
                case 'json':
                    parsedData = JSON.parse(data);
                    break;
                case 'csv':
                    parsedData = this.parseCSV(data);
                    break;
                default:
                    throw new Error('Unsupported format');
            }

            localStorage.setItem('businessProfile', JSON.stringify(parsedData.profile));
            localStorage.setItem('departments', JSON.stringify(parsedData.departments));
            localStorage.setItem('employees', JSON.stringify(parsedData.employees));
            localStorage.setItem('roles', JSON.stringify(parsedData.roles));
            localStorage.setItem('skills', JSON.stringify(parsedData.skills));

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
} 