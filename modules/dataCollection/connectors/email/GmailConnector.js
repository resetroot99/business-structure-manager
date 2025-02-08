class GmailConnector {
    constructor() {
        this.auth = new GoogleOAuth();
        this.gmailAPI = new GoogleAPIClient('gmail');
    }

    async isConnected() {
        return await this.auth.hasValidToken();
    }

    async fetchAnalytics() {
        const emails = await this.fetchEmails();
        const threads = await this.fetchThreads();
        const contacts = await this.fetchContacts();

        return {
            emails,
            threads,
            contacts,
            metadata: await this.extractMetadata(emails),
            patterns: await this.analyzePatterns(threads)
        };
    }

    private async fetchEmails(months = 12) {
        const query = this.buildTimeRangeQuery(months);
        return await this.gmailAPI.messages.list({ query });
    }

    private async fetchThreads() {
        return await this.gmailAPI.threads.list({
            labelIds: ['INBOX', 'SENT']
        });
    }

    private async fetchContacts() {
        return await this.gmailAPI.people.connections.list({
            personFields: ['names', 'emailAddresses', 'organizations']
        });
    }
} 