import { UI } from './ui.js';
import { State } from './state.js';

export const Profile = {
    rewards: {},

    async init() {
        console.log("Profile: Initializing...");
        await this.loadRewards();
        this.bindEvents();
    },

    async loadRewards() {
        try {
            const response = await fetch('data/achievement-rewards.json');
            this.rewards = await response.json();
        } catch (e) {
            console.error("Failed to load achievement rewards", e);
        }
    },

    bindEvents() {
        // Events are now centrally managed by UI.js
        console.log("Profile: Event binding delegated to UI.js");
    },

    showProfile() {
        console.log("Profile: showProfile() called");
        UI.showView('profile-view');
        this.updateStats();
    },

    updateStats() {
        const stats = State.data.stats;
        const maxStat = 20;

        // Animate stat bars
        this.animateStat('courage', stats.courage, maxStat);
        this.animateStat('wisdom', stats.wisdom, maxStat);
        this.animateStat('diplomacy', stats.diplomacy, maxStat);

        // Update chapters completed
        const completedCount = State.data.completedChapters.length;
        document.getElementById('chapters-completed').textContent = `Capítulos: ${completedCount}/5`;

        // Render everything
        this.renderAvatar();
        this.renderUnlockedRewards();
    },

    animateStat(id, value, max) {
        const valEl = document.getElementById(`${id}-value`);
        const barEl = document.getElementById(`${id}-bar`);
        if (!valEl || !barEl) return;

        valEl.textContent = value;
        // Use timeout to ensure CSS transition triggers after view show
        setTimeout(() => {
            barEl.style.width = `${(value / max) * 100}%`;
        }, 100);
    },

    renderAvatar() {
        const accessoriesContainer = document.getElementById('avatar-accessories');
        if (!accessoriesContainer) return;

        accessoriesContainer.innerHTML = '';
        const ownedItems = State.data.ownedItems || [];
        const unlockedRewards = State.data.unlockedRewards || [];

        // Check for Shop Items
        if (ownedItems.includes('sandino_hat')) this.addAccessory('🎩', 'hat');
        if (ownedItems.includes('sandino_bandana')) this.addAccessory('🔴', 'bandana');

        // Check for Achievement Rewards
        if (unlockedRewards.includes('scholar_hat')) this.addAccessory('🎓', 'hat');
        if (unlockedRewards.includes('mexican_poncho')) this.addAccessory('🧣', 'outfit');
        if (unlockedRewards.includes('pioneer_badge')) this.addAccessory('🏅', 'badge');

        // Render base icon
        const baseIcon = document.querySelector('.avatar-icon');
        if (baseIcon) {
            baseIcon.textContent = unlockedRewards.includes('camo_outfit') ? '🎖️' : '👤';
        }
    },

    addAccessory(icon, type) {
        const accessoriesContainer = document.getElementById('avatar-accessories');
        const el = document.createElement('div');
        el.className = `avatar-accessory ${type}`;
        el.textContent = icon;
        accessoriesContainer.appendChild(el);
    },

    renderUnlockedRewards() {
        // This could be an extra section in the profile
        const summary = document.querySelector('.progress-summary');
        if (!summary) return;

        const unlockedRewards = State.data.unlockedRewards || [];
        if (unlockedRewards.length === 0) return;

        let rewardsHTML = '<div class="rewards-showcase"><h4>Recompensas Ganadas</h4><div class="rewards-row">';
        unlockedRewards.forEach(rid => {
            // Find reward info in this.rewards
            for (let aid in this.rewards) {
                if (this.rewards[aid].rewardId === rid) {
                    rewardsHTML += `<span title="${this.rewards[aid].name}">${this.rewards[aid].icon}</span>`;
                }
            }
        });
        rewardsHTML += '</div></div>';

        // Check if already exists to avoid duplication
        if (!summary.querySelector('.rewards-showcase')) {
            summary.innerHTML += rewardsHTML;
        }
    },

    showAchievements() {
        console.log("Profile: showAchievements() called");
        UI.showView('achievements-view');
        this.renderAchievements();
    },

    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';

        const achievements = [
            { id: 'first_chapter', icon: '🌟', title: 'Primera Chispa', description: 'Completa el Capítulo 1', unlocked: State.data.completedChapters.includes('chapter-1') },
            { id: 'mexico_journey', icon: '🛤️', title: 'Viaje a México', description: 'Completa el Capítulo 2', unlocked: State.data.completedChapters.includes('chapter-2') },
            { id: 'rebellion_start', icon: '⚔️', title: 'Inicio de la Rebelión', description: 'Completa el Capítulo 3', unlocked: State.data.completedChapters.includes('chapter-3') },
            { id: 'guerrilla_master', icon: '🏔️', title: 'Maestro de Guerrilla', description: 'Completa el Capítulo 4', unlocked: State.data.completedChapters.includes('chapter-4') },
            { id: 'legacy_keeper', icon: '🕊️', title: 'Guardián del Legado', description: 'Completa el Capítulo 5', unlocked: State.data.completedChapters.includes('chapter-5') },
            { id: 'trivia_master', icon: '📚', title: 'Historiador', description: 'Responde 10 preguntas correctamente en Trivia', unlocked: State.data.triviaScore >= 100 },
            { id: 'brave_heart', icon: '💪', title: 'Corazón Valiente', description: 'Alcanza 10 puntos de Coraje', unlocked: State.data.stats.courage >= 10 },
            { id: 'wise_leader', icon: '🧠', title: 'Líder Sabio', description: 'Alcanza 10 puntos de Sabiduría', unlocked: State.data.stats.wisdom >= 10 }
        ];

        achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? '' : 'locked'}`;

            // Check if it has a reward
            const reward = this.rewards[achievement.id];

            card.innerHTML = `
                <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                ${reward ? `<div class="achievement-reward ${achievement.unlocked ? 'unlocked' : ''}">🎁 Rec: ${reward.name}</div>` : ''}
            `;

            // Logic to unlock reward if achievement is just reached
            if (achievement.unlocked && reward) {
                if (!State.data.unlockedRewards) State.data.unlockedRewards = [];
                if (!State.data.unlockedRewards.includes(reward.rewardId)) {
                    State.data.unlockedRewards.push(reward.rewardId);
                    State.save();
                }
            }

            grid.appendChild(card);
        });
    }
};

