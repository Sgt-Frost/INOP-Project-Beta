import { State } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Engine } from './engine.js';
import { Trivia } from './trivia.js';
import { Profile } from './profile.js';
import { Shop } from './shop.js';
import { Coop } from './coop.js'; // Added Coop import

const App = {
    async init() {
        console.log("Initializing App...");

        try {
            // Initialize Core Modules (Sync)
            State.init();
            Audio.init();

            // Initialize Data Modules (Async)
            // We wait for UI and Shop to load essential JSON data
            await Promise.all([
                UI.init(),
                Shop.init(),
                Profile.init()
            ]);

            Trivia.init();
            Coop.init();

            // All clear, show home
            this.showHome();
            console.log("App Initialized Successfully.");
        } catch (error) {
            console.error("CRITICAL ERROR during initialization:", error);
            // Fallback: Try to at least show home if something failed
            this.showHome();
        }
    },

    showHome() {
        // Here we could update the map based on unlocked chapters from State
        // For now, just show the view
        UI.showView('home-view');

        // Example: Unlock visual indicators on map
        // const unlocked = State.data.unlockedChapters;
        // Map.update(unlocked);
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
