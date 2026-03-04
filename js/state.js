export const State = {
    // Default initial state
    data: {
        unlockedChapters: ['chapter-1'], // Start with Chapter 1 unlocked
        completedChapters: [],
        currentChapterId: null,
        inventory: [], // Items collected
        stats: { // RPG-like stats
            diplomacy: 0,
            courage: 0,
            wisdom: 0
        },
        triviaScore: 0, // Track trivia performance
        currency: 100, // Points for shop purchases
        ownedItems: [], // Purchased items from shop
        equippedAccessories: [], // Currently equipped accessories
        activeTheme: 'sandino_theme', // Active UI theme
        settings: {
            volumeBgm: 0.5,
            volumeSfx: 0.7
        }
    },

    // Load state from localStorage on startup
    init() {
        const saved = localStorage.getItem('nicaraguaComicState');
        if (saved) {
            try {
                this.data = { ...this.data, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Error parsing save data", e);
            }
        }

        // Ensure sandino_theme is always owned (default theme)
        if (!this.data.ownedItems) {
            this.data.ownedItems = [];
        }
        if (!this.data.ownedItems.includes('sandino_theme')) {
            this.data.ownedItems.push('sandino_theme');
        }

        // Set default active theme if none is set
        if (!this.data.activeTheme) {
            this.data.activeTheme = 'sandino_theme';
        }

        // Force initial 100 points if the user hasn't received them yet
        if ((this.data.currency || 0) < 100 && !localStorage.getItem('currency_seeded_v2')) {
            this.data.currency = 100;
            localStorage.setItem('currency_seeded_v2', 'true');
            this.save();
        }

        console.log("State Initialized:", this.data);
    },

    // Save current state to localStorage
    save() {
        localStorage.setItem('nicaraguaComicState', JSON.stringify(this.data));
        console.log("Game Saved");
    },

    // Check if a chapter is unlocked
    isChapterUnlocked(chapterId) {
        return this.data.unlockedChapters.includes(chapterId);
    },

    // Unlock a new chapter
    unlockChapter(chapterId) {
        if (!this.data.unlockedChapters.includes(chapterId)) {
            this.data.unlockedChapters.push(chapterId);
            this.save();
            return true; // Newly unlocked
        }
        return false; // Already unlocked
    },

    // Mark a chapter as complete
    completeChapter(chapterId) {
        if (!this.data.completedChapters.includes(chapterId)) {
            this.data.completedChapters.push(chapterId);
            this.save();
        }
    },

    // Update stats based on decisions
    updateStats(effects) {
        if (!effects) return;
        for (const [key, value] of Object.entries(effects)) {
            if (this.data.stats[key] !== undefined) {
                this.data.stats[key] += value;
            }
        }
        this.save();
    },

    // Get a setting value
    getSetting(key) {
        return this.data.settings[key];
    },

    // Set a setting value
    setSetting(key, value) {
        this.data.settings[key] = value;
        this.save();
    },

    // Reset progress (for testing or "New Game")
    resetProgress() {
        localStorage.removeItem('nicaraguaComicState');
        location.reload();
    },

    getLatestUnlockedChapter() {
        return this.data.unlockedChapters[this.data.unlockedChapters.length - 1];
    }
};
