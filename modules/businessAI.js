class BusinessAI {
    constructor() {
        this.apiEndpoint = 'https://api.shugl.ai/recommendations';
    }

    async generateRecommendations(business) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(business)
        });
        const data = await response.json();
        this.displayRecommendations(data);
    }

    displayRecommendations(recommendations) {
        const recommendationsContainer = document.getElementById('ai-recommendations');
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="card ai-prompt">
                <p>${rec.message}</p>
            </div>
        `).join('');
    }

    async chatPrompt(prompt) {
        const response = await fetch('https://api.shugl.ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        return response.json();
    }
} 