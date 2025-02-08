class GamificationManager {
    constructor() {
        this.achievements = new Map();
        this.leaderboard = [];
        this.loadData();
    }

    addAchievement(userId, achievement) {
        const userAchievements = this.achievements.get(userId) || [];
        if (!userAchievements.includes(achievement)) {
            userAchievements.push(achievement);
            this.achievements.set(userId, userAchievements);
            this.saveData();
        }
    }

    updateLeaderboard(userId, points) {
        const userEntry = this.leaderboard.find(entry => entry.userId === userId);
        if (userEntry) {
            userEntry.points += points;
        } else {
            this.leaderboard.push({ userId, points });
        }
        this.leaderboard.sort((a, b) => b.points - a.points);
        this.saveData();
    }

    getTopPlayers(limit = 10) {
        return this.leaderboard.slice(0, limit);
    }

    saveData() {
        localStorage.setItem('gamificationData', JSON.stringify({
            achievements: Array.from(this.achievements.entries()),
            leaderboard: this.leaderboard
        }));
    }

    loadData() {
        const saved = localStorage.getItem('gamificationData');
        if (saved) {
            const data = JSON.parse(saved);
            this.achievements = new Map(data.achievements);
            this.leaderboard = data.leaderboard;
        }
    }
}

const gamificationManager = new GamificationManager();

// Example achievements
const ACHIEVEMENTS = {
    FIRST_FUNDING: 'First Funding Round',
    TOP_CONTRIBUTOR: 'Top Contributor',
    VOTING_PARTICIPANT: 'Active Voter'
};

export { gamificationManager, ACHIEVEMENTS }; 