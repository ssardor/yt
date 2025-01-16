const { logger } = require('../utils/logger');

class UserStateManager {
    constructor() {
        this.states = new Map();
    }

    setState(userId, state) {
        this.states.set(userId, {
            ...state,
            timestamp: Date.now()
        });
        logger.info(`State set for user ${userId}:`, state);
    }

    getState(userId) {
        return this.states.get(userId);
    }

    clearState(userId) {
        this.states.delete(userId);
    }

    isWaitingForTitle(userId) {
        const state = this.getState(userId);
        return state && state.waitingFor === 'title';
    }

    isWaitingForTags(userId) {
        const state = this.getState(userId);
        return state && state.waitingFor === 'tags';
    }
}

module.exports = new UserStateManager();