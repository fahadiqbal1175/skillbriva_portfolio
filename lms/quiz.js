import {
  auth, db,
  ref, get, set, push,
  getAll, getOne, getWhere, pushItem, setItem, updateItem,
  snapshotToArray,
  requireAuth, getUserProfile, logout
} from './firebase-config.js';
import { showToast, showConfirm, showLoading, getSubjectIcon, getSubjectColor, getScoreBadge, escapeHtml } from './lms-common.js';

let currentUser = null;
let quizId = null;
let quizData = null;
let questions = [];
let answers = [];
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 0;
let startedAt = null;
let tabSwitchCount = 0;
let isSubmitting = false;

// DOM Elements
const screenInfo = document.getElementById('screen-info');
const screenTaking = document.getElementById('screen-taking');
const screenResults = document.getElementById('screen-results');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const authResult = await requireAuth();
        if (!authResult) return;
        currentUser = authResult.user;

        const urlParams = new URLSearchParams(window.location.search);
        quizId = urlParams.get('id');

        await loadQuizData();
        setupEventListeners();
    } catch (error) {
        console.error("Auth error:", error);
    }
});

async function loadQuizData() {
    if (!quizId) {
        // Fallback for testing/demo
        quizData = {
            title: "Sample General Knowledge Quiz",
            courseName: "Basic Islamic Studies",
            subject: "Basic Islamic Studies",
            duration: 5,
            passingScore: 60,
            randomizeQuestions: true,
            randomizeOptions: true
        };
        questions = [
            { type: 'mcq', text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: "Paris" },
            { type: 'mcq', text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars" },
            { type: 'true-false', text: "The Earth is flat.", options: ["True", "False"], correctAnswer: "False" },
            { type: 'mcq', text: "Who wrote Romeo and Juliet?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare" },
            { type: 'short-answer', text: "Explain briefly what photosynthesis is." }
        ];
        
        populateInfoScreen();
        return;
    }

    try {
        // Fetch quiz from RTDB
        quizData = await getOne(`quizzes/${quizId}`);

        if (!quizData) {
            showToast("Quiz not found", "error");
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        questions = quizData.questions || [];

        // Check if already attempted
        const attempts = await getWhere('quizAttempts', 'studentId', currentUser.uid);
        const attempt = attempts.find(a => a.quizId === quizId);

        if (attempt) {
            // Already taken
            showToast("You have already completed this quiz.", "info");
            showResultsScreen(attempt);
            return;
        }

        populateInfoScreen();

    } catch (error) {
        console.error("Error loading quiz:", error);
        showToast("Error loading quiz data", "error");
    }
}

function populateInfoScreen() {
    document.getElementById('info-quiz-title').textContent = quizData.title;
    document.getElementById('info-course-name').textContent = quizData.courseName || 'General Course';
    
    const subject = quizData.subject || 'Basic Islamic Studies';
    const badge = document.getElementById('info-subject-badge');
    badge.innerHTML = `<i class="fas ${getSubjectIcon(subject)}"></i> ${subject}`;
    badge.style.backgroundColor = `var(--${getSubjectColor(subject)}-color, var(--primary-color))`;
    badge.style.color = 'white';

    document.getElementById('info-duration').textContent = quizData.duration || '--';
    document.getElementById('info-total-qs').textContent = questions.length;
    document.getElementById('info-passing').textContent = `${quizData.passingScore || 0}%`;

    screenInfo.classList.add('active');
}

function setupEventListeners() {
    document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
    document.getElementById('btn-prev').addEventListener('click', () => navigateToQuestion(currentQuestionIndex - 1));
    document.getElementById('btn-next').addEventListener('click', () => navigateToQuestion(currentQuestionIndex + 1));
    document.getElementById('btn-submit-nav').addEventListener('click', confirmSubmit);
    document.getElementById('btn-review').addEventListener('click', toggleReview);

    // Anti-cheat tab visibility
    document.addEventListener('visibilitychange', () => {
        if (screenTaking.classList.contains('active') && document.hidden && !isSubmitting) {
            tabSwitchCount++;
            showToast(`Warning: Tab switch detected! (${tabSwitchCount})`, "warning");
        }
    });
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startQuiz() {
    if (quizData.randomizeQuestions) {
        questions = shuffleArray(questions);
    }

    if (quizData.randomizeOptions) {
        questions = questions.map(q => {
            if (q.type === 'mcq' && q.options) {
                return { ...q, options: shuffleArray(q.options) };
            }
            return q;
        });
    }

    answers = new Array(questions.length).fill(null);
    timeLeft = (quizData.duration || 10) * 60;
    startedAt = Date.now();

    screenInfo.classList.remove('active');
    screenTaking.classList.add('active');

    document.getElementById('taking-quiz-title').textContent = quizData.title;
    document.getElementById('taking-total-q').textContent = questions.length;

    buildNavGrid();
    startTimer();
    renderQuestion(0);
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showToast("Time is up! Auto-submitting...", "warning");
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('taking-timer');
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;

    if (timeLeft <= 60) {
        timerEl.classList.remove('warning');
        timerEl.classList.add('danger');
    } else if (timeLeft <= 300) {
        timerEl.classList.add('warning');
    }
}

function buildNavGrid() {
    const grid = document.getElementById('nav-grid');
    grid.innerHTML = '';
    
    questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'lms-quiz-nav-btn';
        btn.textContent = i + 1;
        btn.id = `nav-btn-${i}`;
        btn.addEventListener('click', () => navigateToQuestion(i));
        grid.appendChild(btn);
    });
}

function updateNavStyles() {
    questions.forEach((_, i) => {
        const btn = document.getElementById(`nav-btn-${i}`);
        if (!btn) return;
        
        btn.classList.remove('current', 'answered');
        if (i === currentQuestionIndex) {
            btn.classList.add('current');
        } else if (answers[i] !== null && answers[i] !== '') {
            btn.classList.add('answered');
        }
    });
}

function navigateToQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    // Save current short answer if any
    const q = questions[currentQuestionIndex];
    if (q.type === 'short-answer') {
        const ta = document.getElementById('short-answer-input');
        if (ta) answers[currentQuestionIndex] = ta.value;
    }

    renderQuestion(index);
}

function renderQuestion(index) {
    currentQuestionIndex = index;
    const q = questions[index];
    
    document.getElementById('taking-current-q').textContent = index + 1;
    document.getElementById('q-number').textContent = index + 1;
    document.getElementById('q-text').textContent = q.text;

    const optionsContainer = document.getElementById('q-options');
    optionsContainer.innerHTML = '';

    if (q.type === 'mcq' || q.type === 'true-false') {
        q.options.forEach(opt => {
            const optDiv = document.createElement('div');
            optDiv.className = 'lms-quiz-option';
            if (answers[index] === opt) optDiv.classList.add('selected');
            
            optDiv.innerHTML = `
                <input type="radio" name="q-option" value="${escapeHtml(opt)}" ${answers[index] === opt ? 'checked' : ''}>
                <span>${escapeHtml(opt)}</span>
            `;
            
            optDiv.addEventListener('click', () => {
                optionsContainer.querySelectorAll('.lms-quiz-option').forEach(el => el.classList.remove('selected'));
                optDiv.classList.add('selected');
                optDiv.querySelector('input').checked = true;
                answers[index] = opt;
                updateNavStyles();
            });
            
            optionsContainer.appendChild(optDiv);
        });
    } else if (q.type === 'short-answer') {
        const ta = document.createElement('textarea');
        ta.className = 'lms-textarea';
        ta.id = 'short-answer-input';
        ta.rows = 5;
        ta.placeholder = "Type your answer here...";
        ta.value = answers[index] || '';
        ta.addEventListener('input', (e) => {
            answers[index] = e.target.value;
            updateNavStyles();
        });
        optionsContainer.appendChild(ta);
    }

    // Update Buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    
    if (index === questions.length - 1) {
        btnNext.innerHTML = '<i class="fas fa-check"></i> Submit Quiz';
        btnNext.classList.remove('lms-btn--primary');
        btnNext.classList.add('lms-btn--success');
        btnNext.onclick = confirmSubmit;
    } else {
        btnNext.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        btnNext.classList.add('lms-btn--primary');
        btnNext.classList.remove('lms-btn--success');
        btnNext.onclick = () => navigateToQuestion(index + 1);
    }

    updateNavStyles();
}

async function confirmSubmit() {
    // Save current short answer if any
    const q = questions[currentQuestionIndex];
    if (q.type === 'short-answer') {
        const ta = document.getElementById('short-answer-input');
        if (ta) answers[currentQuestionIndex] = ta.value;
    }

    const unanswered = answers.filter(a => a === null || a === '').length;
    let msg = "Are you sure you want to submit the quiz?";
    if (unanswered > 0) {
        msg = `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`;
    }

    showConfirm("Submit Quiz", msg, async () => {
        await submitQuiz();
    });
}

async function submitQuiz() {
    if (isSubmitting) return;
    isSubmitting = true;
    clearInterval(timerInterval);
    
    let correct = 0;
    let incorrect = 0;
    let autoGradedQs = 0;

    questions.forEach((q, i) => {
        const ans = answers[i];
        if (q.type === 'mcq' || q.type === 'true-false') {
            autoGradedQs++;
            if (ans === q.correctAnswer) {
                correct++;
            } else if (ans !== null && ans !== '') {
                incorrect++;
            }
        }
    });

    const unanswered = answers.filter(a => a === null || a === '').length;
    const percentage = autoGradedQs > 0 ? Math.round((correct / autoGradedQs) * 100) : 0;
    const completedAt = Date.now();
    const timeTakenSeconds = Math.floor((completedAt - startedAt) / 1000);

    const attemptData = {
        quizId: quizId || 'demo-id',
        studentId: currentUser.uid,
        answers: answers,
        score: correct,
        totalPoints: autoGradedQs,
        percentage: percentage,
        startedAt: startedAt,
        completedAt: completedAt,
        timeTakenSeconds: timeTakenSeconds,
        tabSwitchCount: tabSwitchCount,
        unanswered: unanswered,
        incorrect: incorrect
    };

    if (quizId) {
        try {
            await pushItem('quizAttempts', attemptData);
        } catch (error) {
            console.error("Error saving attempt:", error);
            showToast("Failed to save results. Please contact admin.", "error");
        }
    }

    showResultsScreen(attemptData);
}

function showResultsScreen(data) {
    screenTaking.classList.remove('active');
    screenInfo.classList.remove('active');
    screenResults.classList.add('active');

    const passScore = quizData?.passingScore || 60;
    const passed = data.percentage >= passScore;

    const circle = document.getElementById('result-score-circle');
    circle.classList.add(passed ? 'pass' : 'fail');
    
    // Animate percentage
    let currentPct = 0;
    const pctEl = document.getElementById('result-percentage');
    const interval = setInterval(() => {
        if (currentPct >= data.percentage) {
            clearInterval(interval);
            pctEl.textContent = data.percentage;
        } else {
            currentPct++;
            pctEl.textContent = currentPct;
        }
    }, 20);

    const statusEl = document.getElementById('result-status');
    statusEl.textContent = passed ? 'Congratulations, you passed!' : 'Unfortunately, you failed.';
    statusEl.style.color = passed ? 'var(--success-color)' : 'var(--danger-color)';

    const badgeHTML = getScoreBadge(data.percentage);
    document.getElementById('result-badge-container').innerHTML = badgeHTML;

    document.getElementById('res-correct').textContent = data.score;
    document.getElementById('res-incorrect').textContent = data.incorrect;
    document.getElementById('res-unanswered').textContent = data.unanswered;
    
    const m = Math.floor(data.timeTakenSeconds / 60).toString().padStart(2, '0');
    const s = (data.timeTakenSeconds % 60).toString().padStart(2, '0');
    document.getElementById('res-time').textContent = `${m}:${s}`;

    buildReviewSection(data);
}

function toggleReview() {
    const section = document.getElementById('review-section');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    } else {
        section.style.display = 'none';
    }
}

function buildReviewSection(data) {
    const container = document.getElementById('review-container');
    container.innerHTML = '';

    questions.forEach((q, i) => {
        const ans = data.answers[i];
        const isCorrect = ans === q.correctAnswer;
        const isShort = q.type === 'short-answer';

        const item = document.createElement('div');
        item.className = `lms-review-item ${isShort ? '' : (isCorrect ? 'correct' : 'incorrect')}`;
        
        let content = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">Q${i+1}: ${escapeHtml(q.text)}</div>
            <div style="margin-bottom: 0.25rem;">
                <span style="color: var(--text-secondary);">Your Answer:</span> 
                <strong>${ans ? escapeHtml(ans) : '<em>Unanswered</em>'}</strong>
            </div>
        `;

        if (!isShort) {
            content += `
                <div>
                    <span style="color: var(--text-secondary);">Correct Answer:</span> 
                    <strong style="color: var(--success-color);">${escapeHtml(q.correctAnswer)}</strong>
                </div>
            `;
        } else {
            content += `<div style="color: var(--info-color); font-size: 0.9rem; margin-top: 0.5rem;"><i class="fas fa-info-circle"></i> Short answers require manual grading.</div>`;
        }

        item.innerHTML = content;
        container.appendChild(item);
    });
}

