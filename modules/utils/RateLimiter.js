class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.windowSize = 60000; // 1 minute
        this.redis = new Redis();
    }

    async checkLimit(key, limit) {
        const now = Date.now();
        const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowSize)}`;
        
        const pipeline = this.redis.pipeline();
        pipeline.incr(windowKey);
        pipeline.expire(windowKey, Math.ceil(this.windowSize / 1000));
        
        const [count] = await pipeline.exec();
        
        if (count > limit) {
            throw new RateLimitExceeded(`Rate limit exceeded for ${key}`);
        }
        
        return {
            remaining: limit - count,
            reset: Math.ceil(this.windowSize / 1000)
        };
    }

    async throttle(key, limit, func) {
        await this.checkLimit(key, limit);
        return func();
    }
} 