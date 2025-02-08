class BusinessChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.businesses = [];
        this.ai = new BusinessAI();
    }

    addBusiness(business) {
        this.businesses.push(business);
        this.render();
        this.ai.generateRecommendations(business);
    }

    render() {
        this.container.innerHTML = '';
        this.businesses.forEach(business => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${business.name}</h3>
                <p>Type: ${business.type}</p>
                <p>Industry: ${business.industry}</p>
                <button class="btn" onclick="editBusiness('${business.id}')">Edit</button>
            `;
            this.container.appendChild(card);
        });
    }
} 