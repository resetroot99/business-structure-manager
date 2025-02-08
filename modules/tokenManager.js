class BusinessToken {
    constructor(businessId, totalSupply) {
        this.businessId = businessId;
        this.totalSupply = totalSupply;
        this.holders = new Map();
        this.transactionHistory = [];
    }

    issueTokens(address, amount) {
        if (this.getRemainingSupply() < amount) {
            throw new Error('Not enough tokens available');
        }
        const currentBalance = this.holders.get(address) || 0;
        this.holders.set(address, currentBalance + amount);
        this.recordTransaction('issue', address, amount);
    }

    transferTokens(fromAddress, toAddress, amount) {
        if (this.getBalance(fromAddress) < amount) {
            throw new Error('Insufficient balance');
        }
        this.holders.set(fromAddress, this.getBalance(fromAddress) - amount);
        this.holders.set(toAddress, (this.holders.get(toAddress) || 0) + amount);
        this.recordTransaction('transfer', fromAddress, toAddress, amount);
    }

    getBalance(address) {
        return this.holders.get(address) || 0;
    }

    getRemainingSupply() {
        const issued = Array.from(this.holders.values()).reduce((sum, val) => sum + val, 0);
        return this.totalSupply - issued;
    }

    recordTransaction(type, from, to, amount) {
        this.transactionHistory.push({
            type,
            from,
            to,
            amount,
            timestamp: new Date()
        });
    }

    // Add voting functionality
    createProposal(description, options) {
        const proposal = {
            id: Date.now().toString(),
            description,
            options: options.map(option => ({
                text: option,
                votes: 0
            })),
            voters: new Set(),
            executed: false
        };
        this.proposals = this.proposals || [];
        this.proposals.push(proposal);
        return proposal;
    }

    vote(proposalId, optionIndex, voterAddress) {
        const proposal = this.proposals.find(p => p.id === proposalId);
        if (!proposal) throw new Error('Proposal not found');
        if (proposal.voters.has(voterAddress)) throw new Error('Already voted');
        if (optionIndex < 0 || optionIndex >= proposal.options.length) {
            throw new Error('Invalid option');
        }

        proposal.options[optionIndex].votes += this.getBalance(voterAddress);
        proposal.voters.add(voterAddress);
    }

    executeProposal(proposalId) {
        const proposal = this.proposals.find(p => p.id === proposalId);
        if (!proposal) throw new Error('Proposal not found');
        if (proposal.executed) throw new Error('Already executed');
        
        // Execute the winning option
        const winningOption = proposal.options.reduce((prev, current) => 
            (prev.votes > current.votes) ? prev : current
        );
        
        proposal.executed = true;
        return winningOption;
    }

    // Add funding functionality
    createFundingRound(goalAmount, description) {
        const fundingRound = {
            id: Date.now().toString(),
            goalAmount,
            description,
            contributions: new Map(),
            completed: false
        };
        this.fundingRounds = this.fundingRounds || [];
        this.fundingRounds.push(fundingRound);
        return fundingRound;
    }

    contribute(fundingRoundId, contributorAddress, amount) {
        const fundingRound = this.fundingRounds.find(f => f.id === fundingRoundId);
        if (!fundingRound) throw new Error('Funding round not found');
        if (fundingRound.completed) throw new Error('Funding round completed');
        
        const currentContribution = fundingRound.contributions.get(contributorAddress) || 0;
        fundingRound.contributions.set(contributorAddress, currentContribution + amount);
        
        // Issue tokens proportional to contribution
        const tokensToIssue = Math.floor(amount * (this.totalSupply / fundingRound.goalAmount));
        this.issueTokens(contributorAddress, tokensToIssue);
    }
}

class TokenManager {
    constructor() {
        this.tokens = new Map();
    }

    createToken(businessId, totalSupply) {
        if (this.tokens.has(businessId)) {
            throw new Error('Token already exists for this business');
        }
        const token = new BusinessToken(businessId, totalSupply);
        this.tokens.set(businessId, token);
        return token;
    }

    getToken(businessId) {
        return this.tokens.get(businessId);
    }

    issueTokens(businessId, address, amount) {
        const token = this.getToken(businessId);
        if (!token) throw new Error('Token not found');
        token.issueTokens(address, amount);
    }

    transferTokens(businessId, fromAddress, toAddress, amount) {
        const token = this.getToken(businessId);
        if (!token) throw new Error('Token not found');
        token.transferTokens(fromAddress, toAddress, amount);
    }
}

// Initialize token manager
const tokenManager = new TokenManager();

// Example usage:
// tokenManager.createToken('business123', 1000000);
// tokenManager.issueTokens('business123', 'partnerAddress1', 1000);
// tokenManager.transferTokens('business123', 'partnerAddress1', 'partnerAddress2', 500);

export default tokenManager; 