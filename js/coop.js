import { State } from './state.js';
import { UI } from './ui.js';
import { Trivia } from './trivia.js';

export const Coop = {
    isActive: false,
    currentPlayer: 1, // 1 or 2
    scores: {
        p1: 0,
        p2: 0
    },

    setActive(val) {
        this.isActive = val;
        if (!val) this.reset();
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const coopBtn = document.getElementById('btn-start-coop');
        if (coopBtn) {
            coopBtn.addEventListener('click', () => {
                this.startCoopTrivia();
            });
        }
    },

    startCoopTrivia() {
        this.isActive = true;
        this.currentPlayer = 1;
        this.scores = { p1: 0, p2: 0 };

        // Show Coop elements in UI
        const coopStatus = document.getElementById('coop-status');
        const individualScore = document.getElementById('individual-score');

        if (coopStatus) coopStatus.classList.remove('hidden');
        if (individualScore) individualScore.classList.add('hidden');

        this.updateUI();

        // Trigger Trivia
        Trivia.startTrivia();
    },

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateUI();
    },

    addScore(points) {
        if (this.currentPlayer === 1) {
            this.scores.p1 += points;
        } else {
            this.scores.p2 += points;
        }
        this.updateUI();
    },

    updateUI() {
        const p1Pill = document.getElementById('player1-pill');
        const p2Pill = document.getElementById('player2-pill');
        const p1Score = document.getElementById('p1-score');
        const p2Score = document.getElementById('p2-score');

        // Scores
        if (p1Score) p1Score.textContent = this.scores.p1;
        if (p2Score) p2Score.textContent = this.scores.p2;

        // Turn Indicators
        if (p1Pill && p2Pill) {
            if (this.currentPlayer === 1) {
                p1Pill.classList.add('active');
                p2Pill.classList.remove('active');
            } else {
                p1Pill.classList.remove('active');
                p2Pill.classList.add('active');
            }
        }
    },

    reset() {
        this.isActive = false;
        const coopStatus = document.getElementById('coop-status');
        const individualScore = document.getElementById('individual-score');

        if (coopStatus) coopStatus.classList.add('hidden');
        if (individualScore) individualScore.classList.remove('hidden');
    }
};
