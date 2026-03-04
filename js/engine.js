import { State } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';

export const Engine = {
    currentChapter: null,
    currentScene: null,

    async loadChapter(chapterId) {
        UI.showLoading(true);
        try {
            const response = await fetch(`data/${chapterId}.json`);
            if (!response.ok) throw new Error("Chapter data not found");

            this.currentChapter = await response.json();
            console.log("Loaded Chapter:", this.currentChapter.title);

            // Start the first scene
            this.renderScene(this.currentChapter.scenes[0].id);
            UI.showView('comic-view');

            // Mark as current in state
            State.data.currentChapterId = chapterId;
            State.save();

        } catch (error) {
            console.error("Failed to load chapter:", error);
            alert("Error cargando el capítulo. Por favor intenta de nuevo.");
            UI.showView('home-view');
        } finally {
            UI.showLoading(false);
        }
    },

    renderScene(sceneId) {
        const scene = this.currentChapter.scenes.find(s => s.id === sceneId);

        if (!scene) {
            if (sceneId === 'END_CHAPTER') {
                this.endChapter();
                return;
            }
            console.error("Scene not found:", sceneId);
            return;
        }

        this.currentScene = scene;

        // Update UI elements via UI module
        UI.updateSceneBackground(scene.background, scene.mood || 'neutral');
        UI.updateCharacters(scene.characters);
        UI.startDialogue(scene, () => {
            // Callback when dialogue finishes: Show choices
            UI.showChoices(scene.choices, (choice) => this.handleChoice(choice));
        });

        // Play scene audio if defined (optional feature for later)
        // if (scene.bgm) Audio.playBGM(scene.bgm);
    },

    handleChoice(choice) {
        // Apply effects to state
        if (choice.effect) {
            State.updateStats(choice.effect);
            console.log("Stats updated:", State.data.stats);
        }

        // Move to next scene
        this.renderScene(choice.nextSceneId);
    },

    endChapter() {
        alert("¡Capítulo Completado!");
        State.completeChapter(this.currentChapter.id);

        // Unlock next chapter logic (simplified for now)
        // In a real app, logic would map chapter-1 -> chapter-2, etc.
        const nextChapterMap = {
            'chapter-1': 'chapter-2',
            'chapter-2': 'chapter-3',
            'chapter-3': 'chapter-4',
            'chapter-4': 'chapter-5'
        };

        const nextId = nextChapterMap[this.currentChapter.id];
        if (nextId) {
            if (State.unlockChapter(nextId)) {
                alert(`¡Nuevo capítulo desbloqueado: ${nextId}!`);
            }
        }

        UI.showView('home-view');
        this.currentChapter = null;
        this.currentScene = null;
    }
};
