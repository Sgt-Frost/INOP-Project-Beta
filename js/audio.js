import { State } from './state.js';

export const Audio = {
    bgmElement: null,
    sfxElement: null,

    init() {
        this.bgmElement = document.getElementById('bgm-player');
        this.sfxElement = document.getElementById('sfx-player');

        // Load volume settings
        this.updateVolume();
    },

    playBGM(trackPath) {
        if (!trackPath) return;
        // Don't restart if already playing the same track
        if (this.bgmElement.src.includes(trackPath) && !this.bgmElement.paused) return;

        this.bgmElement.src = trackPath;
        this.bgmElement.play().catch(e => console.log("Audio autoplay policy prevented BGM:", e));
    },

    stopBGM() {
        this.bgmElement.pause();
        this.bgmElement.currentTime = 0;
    },

    playSFX(soundPath) {
        if (!soundPath) return;
        // Provide a quick clone for overlapping sounds
        const sfx = new Audio(soundPath);
        sfx.volume = State.getSetting('volumeSfx') || 0.7;
        sfx.play().catch(e => console.log("Audio autoplay policy prevented SFX:", e));
    },

    updateVolume() {
        if (this.bgmElement) {
            this.bgmElement.volume = State.getSetting('volumeBgm') || 0.5;
        }
        if (this.sfxElement) {
            this.sfxElement.volume = State.getSetting('volumeSfx') || 0.7;
        }
    }
};
