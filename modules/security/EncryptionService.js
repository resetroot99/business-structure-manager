class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyManager = new KeyManager();
    }

    async encrypt(data) {
        const key = await this.keyManager.getKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    async decrypt(encryptedData) {
        const key = await this.keyManager.getKey();
        const decipher = crypto.createDecipheriv(
            this.algorithm, 
            key, 
            Buffer.from(encryptedData.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    }
} 