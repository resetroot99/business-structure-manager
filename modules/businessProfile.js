class BusinessProfile {
    constructor() {
        this.profile = {
            type: '',
            size: '',
            objectives: [],
            industry: '',
            establishedDate: null,
            locations: []
        };
    }

    setProfile(profileData) {
        this.profile = { ...this.profile, ...profileData };
        this.saveProfile();
    }

    getProfile() {
        return this.profile;
    }

    addObjective(objective) {
        this.profile.objectives.push(objective);
        this.saveProfile();
    }

    removeObjective(index) {
        this.profile.objectives.splice(index, 1);
        this.saveProfile();
    }

    addLocation(location) {
        this.profile.locations.push(location);
        this.saveProfile();
    }

    removeLocation(index) {
        this.profile.locations.splice(index, 1);
        this.saveProfile();
    }

    saveProfile() {
        localStorage.setItem('businessProfile', JSON.stringify(this.profile));
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('businessProfile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
        }
    }
} 