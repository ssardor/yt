const { logger } = require("../utils/logger");

class QuotaManager {
  constructor() {
    this.quotas = new Map();
    this.plans = {
      basic: {
        dailyLimit: 10,
        videoLength: 60,
        features: ["basic_processing"],
      },
      pro: {
        dailyLimit: 30,
        videoLength: 60,
        features: ["advanced_processing", "trend_analysis", "auto_splitting"],
      },
    };

    // Очистка квот каждые 24 часа
    setInterval(() => {
      this.cleanupExpiredQuotas();
    }, 24 * 60 * 60 * 1000);
  }

  // Добавить метод очистки
  cleanupExpiredQuotas() {
    const now = Date.now();
    for (const [userId, quota] of this.quotas.entries()) {
      if (now >= quota.resetTime) {
        this.quotas.delete(userId);
      }
    }
  }

  async checkQuota(userId) {
    const quota = this.getQuota(userId);
    if (quota.used >= quota.limit) {
      throw new Error("Daily limit reached");
    }
    return true;
  }

  async incrementQuota(userId) {
    const quota = this.getQuota(userId);
    quota.used += 1;
    this.quotas.set(userId, quota);
  }

  getQuota(userId) {
    if (!this.quotas.has(userId)) {
      this.quotas.set(userId, {
        limit: this.plans.basic.dailyLimit,
        used: 0,
        resetTime: this.getNextResetTime(),
      });
    }

    const quota = this.quotas.get(userId);
    if (Date.now() >= quota.resetTime) {
      quota.used = 0;
      quota.resetTime = this.getNextResetTime();
    }

    return quota;
  }

  getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }
}

module.exports = new QuotaManager();
