const db = require("../utils/firebaseConfig");

class PromptModel {
    constructor() {
        this.promptsRef = db.ref('usedPrompts');
    }

    async getUserPrompts(userId) {
        try {
            const snapshot = await this.promptsRef.child(userId).get();
            return snapshot.exists() ? snapshot.val() : '';
        } catch (error) {
            console.error('Error fetching user prompts:', error);
            return '';
        }
    }

    async saveUserPrompt(userId, newPrompt) {
        try {
            const currentPrompts = await this.getUserPrompts(userId);
            const promptsArray = currentPrompts ? [currentPrompts, newPrompt] : [newPrompt];
            return await this.promptsRef.child(userId).set(promptsArray);
        } catch (error) {
            console.error('Error saving user prompt:', error);
            throw error;
        }
    }
}

class GratitudeModel {
    constructor() {
        this.gratitudeRef = db.ref('usedGratitude');
    }

    async getUserGratitude(userId) {
        try {
            const snapshot = await this.gratitudeRef.child(userId).get();
            return snapshot.exists() ? snapshot.val() : '';
        } catch (error) {
            console.error('Error fetching user gratitude:', error);
            return '';
        }
    }

    async saveUserGratitude(userId, newGratitude) {
        try {
            const currentGratitude = await this.getUserGratitude(userId);
            const gratitudeArray = currentGratitude ? [currentGratitude, newGratitude] : [newGratitude];
            return await this.gratitudeRef.child(userId).set(gratitudeArray);
        } catch (error) {
            console.error('Error saving user gratitude:', error);
            throw error;
        }
    }
}

module.exports = {
    PromptModel: new PromptModel(),
    GratitudeModel: new GratitudeModel()
};
