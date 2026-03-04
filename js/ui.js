import { State } from './state.js';

export const UI = {
    async init() {
        this.cacheDOM();
        this.bindEvents();
        await this.loadChapterData();
        this.renderTimeline();
    },

    async loadChapterData() {
        try {
            const response = await fetch('data/chapters.json');
            this.chapters = await response.json();
            console.log("Chapters loaded:", this.chapters);
        } catch (e) {
            console.error("Failed to load chapters index", e);
            this.chapters = [];
        }
    },

    cacheDOM() {
        this.views = {
            loading: document.getElementById('loading-view'),
            home: document.getElementById('home-view'),
            comic: document.getElementById('comic-view'),
            trivia: document.getElementById('trivia-view'),
            profile: document.getElementById('profile-view'),
            achievements: document.getElementById('achievements-view'),
            shop: document.getElementById('shop-view')
        };

        // Filter out null views in case any are missing from HTML
        for (const [key, el] of Object.entries(this.views)) {
            if (!el) {
                console.warn(`UI: View "${key}" not found in DOM.`);
                delete this.views[key];
            }
        }

        this.comicElements = {
            background: document.getElementById('scene-background'),
            characters: document.getElementById('character-stage'),
            dialogueBox: document.getElementById('dialogue-box'),
            charName: document.getElementById('char-name'),
            dialogueText: document.getElementById('dialogue-text'),
            nextBtn: document.getElementById('btn-next-dialogue'),
            choicesOverlay: document.getElementById('choices-overlay'),
            choicesList: document.getElementById('choices-list'),
            activeCharBox: null, // Removed as per user request
            storyFileInput: document.getElementById('story-file-input'),
            charPortraitSquare: document.getElementById('char-portrait-square')
        };
    },

    bindEvents() {
        // Hamburger Menu Toggle
        const hamburgerToggle = document.getElementById('hamburger-toggle');
        const floatingMenu = document.getElementById('floating-menu');

        if (hamburgerToggle && floatingMenu) {
            hamburgerToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!floatingMenu.contains(e.target) && !hamburgerToggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // Close menu when clicking any menu item
            // Close menu when clicking any menu item
            floatingMenu.querySelectorAll('.menu-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                });
            });
        }

        // Custom Image Uploads for Story Mode (RESTORED)
        if (this.comicElements.storyFileInput) {
            this.comicElements.storyFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    if (this.uploadTarget === 'background') {
                        this.comicElements.background.style.backgroundImage = `url('${dataUrl}')`;
                        this.comicElements.background.style.backgroundSize = 'cover';
                    } else if (this.uploadTarget === 'character' || this.uploadTarget === 'character-square') {
                        const imgHtml = `<img src="${dataUrl}" class="character-sprite-square">`;
                        this.comicElements.charPortraitSquare.innerHTML = imgHtml;
                    }
                };
                reader.readAsDataURL(file);
            });

            // Make background and character box clickable for gallery upload
            this.comicElements.background.addEventListener('click', () => {
                this.uploadTarget = 'background';
                this.comicElements.storyFileInput.click();
            });

            // Note: activeCharBox click listener removed

            this.comicElements.charPortraitSquare.addEventListener('click', () => {
                this.uploadTarget = 'character-square';
                this.comicElements.storyFileInput.click();
            });
        }

        // Main Menu Button - Load latest unlocked chapter
        document.getElementById('btn-start-adventure').addEventListener('click', async () => {
            console.log("UI: Adventure button clicked");
            const { Engine } = await import('./engine.js');
            const latestChapter = State.getLatestUnlockedChapter();
            Engine.loadChapter(latestChapter || 'chapter-1');
        });

        // Global Back to Home Buttons
        const backHomeBtns = [...document.querySelectorAll('.btn-back-home')];
        const homeBtn = document.getElementById('btn-home');
        if (homeBtn) backHomeBtns.push(homeBtn);

        backHomeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showView('home-view');
                this.renderTimeline();
            });
        });

        // Feature View Buttons (Dynamic Imports to avoid circular dependencies)
        const viewBindings = {
            'btn-profile': async () => {
                const { Profile } = await import('./profile.js');
                Profile.showProfile();
            },
            'btn-achievements': async () => {
                const { Profile } = await import('./profile.js');
                Profile.showAchievements();
            },
            'btn-shop': async () => {
                const { Shop } = await import('./shop.js');
                Shop.showShop();
            },
            'btn-start-trivia': async () => {
                const { Trivia } = await import('./trivia.js');
                const { Coop } = await import('./coop.js');
                Coop.setActive(false);
                Trivia.startTrivia();
            },
            'btn-start-coop': async () => {
                const { Trivia } = await import('./trivia.js');
                const { Coop } = await import('./coop.js');
                Coop.setActive(true);
                Trivia.startTrivia();
            }
        };

        Object.entries(viewBindings).forEach(([id, callback]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    console.log(`UI: Centrally handling click for "${id}"`);
                    await callback();
                    this.closeMenu();
                });
            }
        });
    },

    toggleMenu() {
        const hamburgerToggle = document.getElementById('hamburger-toggle');
        const floatingMenu = document.getElementById('floating-menu');

        const isOpen = floatingMenu.classList.toggle('open');
        hamburgerToggle.classList.toggle('active');
        hamburgerToggle.setAttribute('aria-expanded', isOpen);
    },

    closeMenu() {
        const hamburgerToggle = document.getElementById('hamburger-toggle');
        const floatingMenu = document.getElementById('floating-menu');

        floatingMenu.classList.remove('open');
        hamburgerToggle.classList.remove('active');
        hamburgerToggle.setAttribute('aria-expanded', 'false');
    },

    showView(viewId) {
        console.log(`UI: Switching to view "${viewId}"`);

        // Auto-close menu when navigating
        this.closeMenu();

        // 1. Hide all views in cache
        if (this.views) {
            Object.values(this.views).forEach(el => {
                if (el) el.classList.add('hidden');
            });
        }

        // 2. Identify target view
        const simpleId = viewId.replace('-view', '');
        let target = (this.views && this.views[simpleId]) || document.getElementById(viewId);

        // 3. Fallback: search DOM
        if (!target) {
            console.warn(`UI: View "${viewId}" not in cache. Searching DOM...`);
            target = document.getElementById(viewId);
        }

        if (target) {
            target.classList.remove('hidden');
            // Force block display to resolve potential CSS conflicts
            target.style.display = 'block';
            console.info(`UI: SUCCESS - View "${viewId}" is now visible.`);

            // View-specific refreshes
            if (viewId === 'home-view') this.renderTimeline();
            if (viewId === 'shop-view') import('./shop.js').then(m => m.Shop.renderShop());
        } else {
            console.error(`UI: ERROR - View "${viewId}" element not found.`);
            // Safe fallback to home
            if (viewId !== 'home-view') this.showView('home-view');
        }
    },

    showLoading(isLoading) {
        const loadingView = this.views.loading;
        if (!loadingView) return;

        if (isLoading) {
            loadingView.classList.remove('hidden');
        } else {
            loadingView.classList.add('hidden');
        }
    },

    renderTimeline() {
        const container = document.getElementById('historical-timeline');
        if (!container) return;

        // Clear old nodes
        const existingNodes = container.querySelectorAll('.timeline-node');
        existingNodes.forEach(node => node.remove());

        // Calculate positions based on years (1912-1934)
        const minYear = 1912;
        const maxYear = 1934;
        const yearRange = maxYear - minYear;

        this.chapters.forEach((chapter, index) => {
            const isUnlocked = State.isChapterUnlocked(chapter.id);
            const isCompleted = State.data.completedChapters.includes(chapter.id);

            // Calculate position as percentage (5% to 95% to avoid edges)
            const yearPosition = ((chapter.year - minYear) / yearRange) * 90 + 5;

            const node = document.createElement('div');
            node.className = `timeline-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;
            node.style.left = `${yearPosition}%`;

            const circle = document.createElement('div');
            circle.className = 'timeline-node-circle';
            circle.textContent = index + 1;

            // Apply passport thumbnail if exists
            if (chapter.thumbnail) {
                circle.style.backgroundImage = `url('${chapter.thumbnail}')`;
                circle.textContent = ''; // Hide number if we have a photo
            }

            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = chapter.title;

            const year = document.createElement('div');
            year.className = 'timeline-year';
            year.textContent = chapter.year;

            node.appendChild(label);
            node.appendChild(circle);
            node.appendChild(year);

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    this.loadSpecificChapter(chapter.id);
                });
                node.title = `${chapter.title} - Click para jugar`;
            } else {
                node.title = `${chapter.title} - Bloqueado`;
            }

            container.appendChild(node);
        });

        this.renderChapterGrid();
    },

    renderChapterGrid() {
        const grid = document.getElementById('chapter-grid');
        if (!grid) return;
        grid.innerHTML = '';

        this.chapters.forEach((chapter) => {
            const isUnlocked = State.isChapterUnlocked(chapter.id);
            const isCompleted = State.data.completedChapters.includes(chapter.id);

            const card = document.createElement('div');
            card.className = `chapter-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;

            card.innerHTML = `
                <div class="chapter-card-inner">
                    <div class="chapter-image" style="background-image: url('${chapter.thumbnail || 'assets/images/placeholder-chapter.jpg'}')">
                        <div class="chapter-status-badge">${isUnlocked ? (isCompleted ? '✨ Completado' : '🔓 Desbloqueado') : '🔒 Bloqueado'}</div>
                    </div>
                    <div class="chapter-info">
                        <h3>Capítulo ${chapter.id.split('-')[1]}</h3>
                        <h4>${chapter.title}</h4>
                        <p>${chapter.year}</p>
                        <button class="play-btn" ${isUnlocked ? '' : 'disabled'}>
                            ${isUnlocked ? 'Jugar Ahora' : 'Bloqueado'}
                        </button>
                    </div>
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => this.loadSpecificChapter(chapter.id));
            }

            grid.appendChild(card);
        });
    },

    async loadSpecificChapter(chapterId) {
        const { Engine } = await import('./engine.js');
        Engine.loadChapter(chapterId);
    },

    updateSceneBackground(imageUrl, mood = 'neutral') {
        // Clear previous moods
        const bg = this.comicElements.background;
        bg.classList.remove('comic-mood-rural', 'comic-mood-industrial', 'comic-mood-jungle', 'comic-mood-war', 'comic-mood-peace');

        if (mood !== 'neutral') {
            bg.classList.add(`comic-mood-${mood}`);
        }

        if (imageUrl && !imageUrl.startsWith('none')) {
            bg.style.backgroundImage = `url('${imageUrl}')`;
        } else {
            // If no image, patterns will show via mood classes
            bg.style.backgroundImage = 'none';
        }

        // Trigger Page Flip Animation
        const wrapper = document.querySelector('.page-wrapper');
        if (wrapper) {
            wrapper.classList.remove('turning-page');
            void wrapper.offsetWidth; // Trigger reflow
            wrapper.classList.add('turning-page');
        }
    },

    updateCharacters(characters) {
        this.comicElements.characters.innerHTML = ''; // Clear previous characters
        if (!characters) return;

        characters.forEach(char => {
            const img = document.createElement('img');
            img.src = char.image;
            img.alt = char.name;
            img.classList.add('character-sprite');

            // Handle missing images with placeholder style
            img.onerror = () => {
                img.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'char-placeholder';
                placeholder.textContent = char.name;
                // Add positioning logic here if needed
                this.comicElements.characters.appendChild(placeholder);
            };

            // Positioning logic (simplified)
            if (char.position === 'left') {
                img.style.marginRight = 'auto';
            } else if (char.position === 'right') {
                img.style.marginLeft = 'auto';
            } else {
                img.style.margin = '0 auto';
            }

            this.comicElements.characters.appendChild(img);
        });
    },

    startDialogue(scene, onComplete) {
        const dialogueLines = scene.dialogue;
        let currentIndex = 0;

        const showLine = () => {
            if (currentIndex >= dialogueLines.length) {
                onComplete(); // All lines shown
                return;
            }

            const line = dialogueLines[currentIndex];
            this.comicElements.charName.textContent = line.speaker;
            this.comicElements.dialogueText.textContent = line.text;

            // NEW: Handle Contextual Full-Screen Background from JSON
            // If the specific dialogue line has a background, use it; otherwise use the scene's default background
            const currentScene = scene;
            if (line.background) {
                this.comicElements.background.style.backgroundImage = `url('${line.background}')`;
            } else if (currentScene && currentScene.background) {
                this.comicElements.background.style.backgroundImage = `url('${currentScene.background}')`;
            }

            // Handle Character Portrait Box (Quadro) - Code-Driven & Uploadable
            if (line.speaker === 'Narrador') {
                this.comicElements.charPortraitSquare.classList.add('hidden');
            } else {
                this.comicElements.charPortraitSquare.classList.remove('hidden');

                const charImg = line.portrait || (currentScene && currentScene.characters ? currentScene.characters.find(c => c.name === line.speaker)?.image : null);

                if (charImg) {
                    const imgHtml = `<img src="${charImg}" alt="${line.speaker}">`;
                    this.comicElements.charPortraitSquare.innerHTML = imgHtml;
                } else {
                    const placeholderHtml = `<div class="placeholder">${line.speaker.charAt(0)}</div>`;
                    this.comicElements.charPortraitSquare.innerHTML = placeholderHtml;
                }
            }

            // Adjust dialogue box padding for narrator vs speaker
            if (line.speaker === 'Narrador') {
                this.comicElements.dialogueBox.style.paddingLeft = '30px';
            } else {
                this.comicElements.dialogueBox.style.paddingLeft = '30px'; // No circle portrait anymore
            }

            // Comic Style: Colored Bubbles based on Speaker
            const box = this.comicElements.dialogueBox;
            // Clear previous speaker classes
            box.classList.remove('bubble-sandino', 'bubble-narrator', 'bubble-enemy', 'bubble-neutral');

            if (line.speaker.includes('Sandino')) box.classList.add('bubble-sandino');
            else if (line.speaker === 'Narrador') box.classList.add('bubble-narrator');
            else if (line.speaker.includes('Moncada') || line.speaker.includes('Yanqui') || line.speaker.includes('Somoza')) box.classList.add('bubble-enemy');
            else box.classList.add('bubble-neutral');

            // Create a one-time handler for the next button
            this.comicElements.nextBtn.textContent = (currentIndex === dialogueLines.length - 1) ? "Continuar" : "Siguiente";

            // USE ONCLICK TO CLEAR PREVIOUS AND PREVENT STACKING
            this.comicElements.nextBtn.onclick = (e) => {
                e.preventDefault();
                currentIndex++;
                showLine();
            };
        };

        showLine();
    },

    showChoices(choices, onChoiceCallback) {
        const list = this.comicElements.choicesList;
        list.innerHTML = ''; // Clear old buttons

        this.comicElements.choicesOverlay.classList.remove('hidden');
        this.comicElements.choicesOverlay.style.display = 'flex'; // Ensure flex for center

        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.classList.add('choice-btn');
            btn.textContent = choice.text;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("Choice selected:", choice.text);
                this.comicElements.choicesOverlay.classList.add('hidden');
                this.comicElements.choicesOverlay.style.display = 'none';
                onChoiceCallback(choice);
            });
            list.appendChild(btn);
        });
    }
};
