import { State } from './state.js';
import { UI } from './ui.js';

export const Shop = {
    items: [],

    async init() {
        console.log("Shop: Initializing shop items and theme...");
        await this.loadItems();
        this.bindEvents();
        this.applyTheme(State.data.activeTheme); // Apply saved theme on init
        this.renderShop(); // NEW: Ensure points and items are rendered immediately
        console.log("Shop: Initialization complete.");
    },

    async loadItems() {
        try {
            const response = await fetch('data/shop-items.json');
            this.items = await response.json();
        } catch (e) {
            console.error("Failed to load shop items", e);
            this.items = [];
        }
    },

    bindEvents() {
        // Events are now centrally managed by UI.js
        console.log("Shop: Event binding delegated to UI.js");
    },

    showShop() {
        UI.showView('shop-view');
        this.renderShop();
    },

    renderShop() {
        const grid = document.getElementById('shop-items-grid');
        const currencyDisplay = document.getElementById('player-currency');

        if (!grid) return;

        grid.innerHTML = '';
        currencyDisplay.textContent = State.data.currency || 0;

        this.items.forEach(item => {
            const owned = State.data.ownedItems?.includes(item.id) || false;
            const isActiveTheme = item.type === 'theme' && State.data.activeTheme === item.id;

            const card = document.createElement('div');
            card.className = `shop-item-card ${owned ? 'owned' : ''} ${isActiveTheme ? 'active-theme' : ''}`;

            let cardContent = `
                <div class="item-icon">${item.icon}</div>
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
            `;

            // Add theme preview for theme items
            if (item.type === 'theme' && item.colors) {
                cardContent += `
                    <div class="theme-preview">
                        <div class="color-swatch" style="background: ${item.colors.primary}"></div>
                        <div class="color-swatch" style="background: ${item.colors.secondary}"></div>
                        <div class="color-swatch" style="background: ${item.colors.accent}"></div>
                        <div class="color-swatch" style="background: ${item.colors.bg}"></div>
                    </div>
                `;
            }

            cardContent += `
                <div class="item-footer">
                    <span class="item-price">${item.price} pts</span>
            `;

            if (item.type === 'theme' && owned) {
                cardContent += `
                    <button class="btn-apply-theme" data-item-id="${item.id}" ${isActiveTheme ? 'disabled' : ''}>
                        ${isActiveTheme ? '✓ Activo' : 'Aplicar'}
                    </button>
                `;
            } else {
                cardContent += `
                    <button class="btn-purchase" data-item-id="${item.id}" ${owned ? 'disabled' : ''}>
                        ${owned ? '✓ Comprado' : 'Comprar'}
                    </button>
                `;
            }

            cardContent += `
                </div>
            `;

            card.innerHTML = cardContent;

            // Bind purchase button
            const purchaseBtn = card.querySelector('.btn-purchase');
            if (purchaseBtn && !owned) {
                purchaseBtn.addEventListener('click', () => this.purchaseItem(item));
            }

            // Bind apply theme button
            const applyBtn = card.querySelector('.btn-apply-theme');
            if (applyBtn && !isActiveTheme) {
                applyBtn.addEventListener('click', () => this.applyThemeFromShop(item));
            }

            grid.appendChild(card);
        });
    },

    purchaseItem(item) {
        const currentCurrency = State.data.currency || 0;

        if (currentCurrency < item.price) {
            alert('¡No tienes suficientes puntos!');
            return;
        }

        // Deduct currency
        State.data.currency = currentCurrency - item.price;

        // Add item to owned items
        if (!State.data.ownedItems) State.data.ownedItems = [];
        State.data.ownedItems.push(item.id);

        State.save();
        this.renderShop();

        alert(`¡Has comprado ${item.name}!`);
    },

    applyThemeFromShop(item) {
        State.data.activeTheme = item.id;
        this.applyTheme(item.id);
        State.save();
        this.renderShop();
        alert(`Tema "${item.name}" aplicado correctamente`);
    },

    applyTheme(themeId) {
        const root = document.documentElement;
        const body = document.body;
        State.data.activeTheme = themeId;
        State.save();

        // Theme management
        body.classList.remove('theme-sandino', 'theme-blue');

        if (themeId === 'blue_white_theme') {
            body.classList.add('theme-blue');
            root.style.setProperty('--color-primary', '#0047AB');
            root.style.setProperty('--color-secondary', '#ffffff');
            root.style.setProperty('--color-accent', '#00BFFF');
            root.style.setProperty('--color-accent-rgb', '0, 191, 255');
            root.style.setProperty('--color-bg', '#f0f4f8');
            root.style.setProperty('--color-text-main', '#1a1a1a');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.9)');
            root.style.setProperty('--glass-border', 'rgba(0, 71, 171, 0.2)');
            root.style.setProperty('--bubble-border', '#0047AB');
            root.style.setProperty('--bubble-bg', '#ffffff');
            root.style.setProperty('--bubble-text', '#1a1a1a');
            root.style.setProperty('--bg-pattern', 'radial-gradient(circle at 2px 2px, #0047AB 1px, transparent 0)');
            root.style.setProperty('--shadow-soft', '0 4px 6px rgba(0, 71, 171, 0.1)');
            root.style.setProperty('--shadow-hard', '0 8px 15px rgba(0, 71, 171, 0.2)');
        } else {
            body.classList.add('theme-sandino');
            root.style.setProperty('--color-primary', '#8B0000');
            root.style.setProperty('--color-secondary', '#F4E4BC');
            root.style.setProperty('--color-accent', '#D4AF37');
            root.style.setProperty('--color-accent-rgb', '212, 175, 55');
            root.style.setProperty('--color-bg', '#1a0505');
            root.style.setProperty('--color-text-main', '#F4E4BC');
            root.style.setProperty('--glass-bg', 'rgba(26, 5, 5, 0.95)');
            root.style.setProperty('--glass-border', 'rgba(139, 0, 0, 0.3)');
            root.style.setProperty('--bubble-bg', '#fff');
            root.style.setProperty('--bubble-text', '#1a1a1a');
            root.style.setProperty('--bubble-border', '#000');
            root.style.setProperty('--bg-pattern', 'linear-gradient(135deg, #1a0505 0%, #2c0b0b 50%, #1a0505 100%)');
            root.style.setProperty('--shadow-soft', '0 4px 6px rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--shadow-hard', '0 8px 15px rgba(0, 0, 0, 0.5)');
        }

        this.renderShop();
    }
};
