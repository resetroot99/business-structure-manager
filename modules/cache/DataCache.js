class DataCache {
    constructor() {
        this.redis = new Redis();
        this.defaultTTL = 3600; // 1 hour
    }

    async get(key) {
        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        return null;
    }

    async set(key, data, ttl = this.defaultTTL) {
        await this.redis.set(
            key,
            JSON.stringify(data),
            'EX',
            ttl
        );
    }

    async getOrFetch(key, fetchFunc, ttl = this.defaultTTL) {
        const cached = await this.get(key);
        if (cached) {
            return cached;
        }

        const data = await fetchFunc();
        await this.set(key, data, ttl);
        return data;
    }

    async invalidate(key) {
        await this.redis.del(key);
    }

    async invalidatePattern(pattern) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(keys);
        }
    }
} 