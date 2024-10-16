class RateLimiter {
  constructor(limit, interval) {
    this.limit = limit;
    this.interval = interval;
    this.tokens = limit;
    this.lastRefill = Date.now();
  }

  async waitForToken() {
    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRefill;
    const refillAmount = Math.floor(timeSinceLastRefill / this.interval) * this.limit;

    this.tokens = Math.min(this.limit, this.tokens + refillAmount);
    this.lastRefill = now;

    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    const waitTime = this.interval - (now % this.interval);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.waitForToken();
  }
}

// 100 requests per 10 seconds
export const solanaBeachRateLimiter = new RateLimiter(100, 10000);
