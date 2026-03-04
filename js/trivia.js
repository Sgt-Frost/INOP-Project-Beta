import { UI } from './ui.js';
import { State } from './state.js';
import { Coop } from './coop.js';

export const Trivia = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    isGameActive: false,
    userAnswers: {}, // For matching and timeline questions

    async init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.elements = {
            view: document.getElementById('trivia-view'),
            questionText: document.getElementById('trivia-question'),
            optionsContainer: document.getElementById('trivia-options'),
            feedbackPanel: document.getElementById('trivia-feedback'),
            feedbackTitle: document.getElementById('feedback-title'),
            feedbackText: document.getElementById('feedback-text'),
            scoreDisplay: document.getElementById('trivia-score'),
            nextBtn: document.getElementById('btn-next-trivia'),
            startBtn: document.getElementById('btn-start-trivia')
        };
    },

    bindEvents() {
        // Core game listeners (Next Question)
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        // Navigation (Back Home) listeners for Coop reset
        document.querySelectorAll('.btn-back-home, #btn-home').forEach(btn => {
            btn.addEventListener('click', () => {
                if (Coop.isActive) Coop.reset();
            });
        });

        console.log("Trivia: Core listeners bound. Main navigation delegated to UI.js.");
    },

    async startTrivia() {
        UI.showLoading(true);
        try {
            const response = await fetch('data/questions.json');
            this.questions = await response.json();

            // Shuffle questions
            for (let i = this.questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
            }

            this.currentQuestionIndex = 0;
            this.score = 0;
            this.isGameActive = true;
            this.updateScore();

            UI.showView('trivia-view');
            this.showQuestion();

        } catch (error) {
            console.error("Error loading trivia:", error);
            alert("No se pudieron cargar las preguntas.");
        } finally {
            UI.showLoading(false);
        }
    },

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endTrivia();
            return;
        }

        const q = this.questions[this.currentQuestionIndex];

        // Coop Indicator in title
        if (Coop.isActive) {
            this.elements.questionText.innerHTML = `<span class="coop-turn-notice">Turno de Jugador ${Coop.currentPlayer}</span><br>${q.question}`;
        } else {
            this.elements.questionText.textContent = q.question;
        }

        this.elements.optionsContainer.innerHTML = '';
        this.elements.feedbackPanel.classList.add('hidden');
        this.userAnswers = {};

        // Render based on question type
        switch (q.type) {
            case 'multiple_choice': this.renderMultipleChoice(q); break;
            case 'true_false': this.renderTrueFalse(q); break;
            case 'fill_blank': this.renderFillBlank(q); break;
            case 'matching': this.renderMatching(q); break;
            case 'timeline': this.renderTimeline(q); break;
            default: this.renderMultipleChoice(q); // Fallback
        }
    },

    renderMultipleChoice(q) {
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'trivia-option';
            btn.textContent = opt;
            btn.onclick = () => this.handleMultipleChoice(index, q);
            this.elements.optionsContainer.appendChild(btn);
        });
    },

    renderTrueFalse(q) {
        const trueBtn = document.createElement('button');
        trueBtn.className = 'trivia-option';
        trueBtn.textContent = '✓ Verdadero';
        trueBtn.onclick = () => this.handleTrueFalse(true, q);

        const falseBtn = document.createElement('button');
        falseBtn.className = 'trivia-option';
        falseBtn.textContent = '✗ Falso';
        falseBtn.onclick = () => this.handleTrueFalse(false, q);

        this.elements.optionsContainer.appendChild(trueBtn);
        this.elements.optionsContainer.appendChild(falseBtn);
    },

    renderFillBlank(q) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'fill-blank-input';
        input.placeholder = 'Escribe tu respuesta...';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'trivia-option';
        submitBtn.textContent = 'Enviar Respuesta';
        submitBtn.onclick = () => this.handleFillBlank(input.value, q);

        this.elements.optionsContainer.appendChild(input);
        this.elements.optionsContainer.appendChild(submitBtn);
    },

    renderMatching(q) {
        const container = document.createElement('div');
        container.className = 'matching-container';

        const leftColumn = document.createElement('div');
        leftColumn.className = 'matching-column';

        const rightColumn = document.createElement('div');
        rightColumn.className = 'matching-column';

        // Shuffle right items
        const rightItems = [...q.pairs.map(p => p.right)];
        for (let i = rightItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
        }

        q.pairs.forEach((pair, index) => {
            const el = document.createElement('div');
            el.className = 'matching-item';
            el.textContent = pair.left;
            leftColumn.appendChild(el);
        });

        rightItems.forEach(item => {
            const el = document.createElement('button');
            el.className = 'matching-item matching-option';
            el.textContent = item;
            el.onclick = () => {
                this.elements.optionsContainer.querySelectorAll('.matching-option').forEach(o => o.classList.remove('selected'));
                el.classList.add('selected');
            };
            rightColumn.appendChild(el);
        });

        container.appendChild(leftColumn);
        container.appendChild(rightColumn);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'trivia-option';
        submitBtn.textContent = 'Confirmar Selección';
        submitBtn.onclick = () => this.showFeedback(true, q); // Simplified

        this.elements.optionsContainer.appendChild(container);
        this.elements.optionsContainer.appendChild(submitBtn);
    },

    selectMatchingItem(item) {
        const selected = this.elements.optionsContainer.querySelector('.matching-option.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        item.classList.add('selected');
    },

    renderTimeline(q) {
        const container = document.createElement('div');
        container.className = 'timeline-container';
        container.innerHTML = '<p class="timeline-instruction">Arrastra para ordenar cronológicamente:</p>';

        const list = document.createElement('div');
        list.className = 'timeline-list';

        q.items.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'timeline-item';
            el.draggable = true;
            el.textContent = `${index + 1}. ${item}`;
            el.dataset.originalIndex = index;

            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', el.innerHTML);
                el.classList.add('dragging');
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
            });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = list.querySelector('.dragging');
                const afterElement = this.getDragAfterElement(list, e.clientY);
                if (afterElement == null) {
                    list.appendChild(dragging);
                } else {
                    list.insertBefore(dragging, afterElement);
                }
            });

            list.appendChild(el);
        });

        container.appendChild(list);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'trivia-option submit-timeline';
        submitBtn.textContent = 'Verificar Orden';
        submitBtn.onclick = () => this.showFeedback(true, q); // Simplified

        this.elements.optionsContainer.appendChild(container);
        this.elements.optionsContainer.appendChild(submitBtn);
    },

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.timeline-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    handleMultipleChoice(index, q) {
        const isCorrect = index === q.correct;
        this.showFeedback(isCorrect, q);
    },

    handleTrueFalse(val, q) {
        const isCorrect = val === q.correct;
        this.showFeedback(isCorrect, q);
    },

    handleFillBlank(val, q) {
        const isCorrect = val.trim().toLowerCase() === q.correct.toLowerCase();
        this.showFeedback(isCorrect, q);
    },

    showFeedback(isCorrect, question) {
        const buttons = this.elements.optionsContainer.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        if (isCorrect) {
            const points = 10;
            if (Coop.isActive) {
                Coop.addScore(points);
                this.elements.feedbackTitle.textContent = `¡Correcto! Jugador ${Coop.currentPlayer} +${points} pts 💰`;
            } else {
                this.score += points;
                this.updateScore();
                State.data.currency = (State.data.currency || 0) + points;
                State.save();
                this.elements.feedbackTitle.textContent = "¡Correcto! +10 puntos 💰";
            }
            this.elements.feedbackTitle.style.color = "var(--color-primary)";
        } else {
            this.elements.feedbackTitle.textContent = "Incorrecto";
            this.elements.feedbackTitle.style.color = "#d32f2f";
        }

        this.elements.feedbackText.textContent = question.explanation;
        this.elements.feedbackPanel.classList.remove('hidden');
    },

    nextQuestion() {
        if (Coop.isActive) Coop.switchTurn();
        this.currentQuestionIndex++;
        this.showQuestion();
    },

    updateScore() {
        this.elements.scoreDisplay.textContent = this.score;
    },

    endTrivia() {
        this.elements.questionText.textContent = "¡Desafío Completado!";

        let endHTML = '';
        if (Coop.isActive) {
            const winner = Coop.scores.p1 > Coop.scores.p2 ? "Jugador 1" : (Coop.scores.p2 > Coop.scores.p1 ? "Jugador 2" : "Empate");
            endHTML = `
                <div class="coop-results">
                    <h3>Ganador: ${winner}</h3>
                    <p>P1: ${Coop.scores.p1} pts | P2: ${Coop.scores.p2} pts</p>
                </div>
            `;
        } else {
            endHTML = `<p style="font-size: 1.5rem; color: var(--color-accent); text-align: center; margin: 20px 0;">Puntuación Final: ${this.score}</p>`;
        }

        this.elements.optionsContainer.innerHTML = endHTML;
        this.elements.feedbackPanel.classList.add('hidden');
    }
};
