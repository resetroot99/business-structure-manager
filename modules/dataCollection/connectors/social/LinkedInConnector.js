class LinkedInConnector {
    constructor() {
        this.auth = new LinkedInOAuth();
        this.api = new LinkedInAPI();
    }

    async hasValidAuth() {
        return await this.auth.checkToken();
    }

    async getProfileData() {
        return {
            basic: await this.api.getBasicProfile(),
            experience: await this.api.getExperience(),
            education: await this.api.getEducation(),
            skills: await this.api.getSkills(),
            recommendations: await this.api.getRecommendations()
        };
    }

    async getConnectionsData() {
        const connections = await this.api.getConnections();
        return {
            firstDegree: await this.processConnections(connections),
            secondDegree: await this.getSecondDegreeConnections(),
            industry: await this.analyzeIndustryDistribution(connections)
        };
    }

    async getEngagementMetrics() {
        return {
            posts: await this.api.getPosts(),
            interactions: await this.api.getInteractions(),
            activity: await this.api.getActivityMetrics(),
            reach: await this.calculateReach()
        };
    }
} 