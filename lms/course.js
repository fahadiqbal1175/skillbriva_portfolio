import {
  auth, db, storage,
  ref, get, set, push, update,
  getAll, getOne, getWhere, pushItem, setItem, updateItem,
  snapshotToArray,
  storageRef, uploadBytes, getDownloadURL,
  requireAuth, getUserProfile, logout
} from './firebase-config.js';

import {
  showToast, showModal, showLoading, showEmpty,
  initSidebar, initTabs, formatDate, formatTime,
  getSubjectIcon, getSubjectColor, formatFileSize,
  getScoreBadge, renderAvatar, escapeHtml, truncate
} from './lms-common.js';

let currentUser = null;
let userProfile = null;
let currentCourseId = null;
let courseData = null;

// Demo data for fallback
const demoCourse = {
    id: 'demo-cs101',
    title: 'Introduction to Computer Science',
    subject: 'Computer Science',
    description: 'Learn the fundamentals of computer science, programming logic, and computational thinking. This course is designed for absolute beginners.',
    longDescription: 'This comprehensive course covers everything you need to know to get started in Computer Science. From binary numbers and basic algorithms to writing your first programs in Python. You will learn how computers process information, how the internet works, and how to solve problems using computational thinking.',
    objectives: [
        'Understand basic computer architecture and how computers work',
        'Write basic programs using Python',
        'Understand and apply fundamental algorithms',
        'Solve problems using computational thinking'
    ],
    modules: [
        { id: 'm1', title: 'Module 1: Introduction to Computing', description: 'What is a computer? History and basic architecture.' },
        { id: 'm2', title: 'Module 2: Programming Fundamentals', description: 'Variables, loops, and conditions.' },
        { id: 'm3', title: 'Module 3: Algorithms and Data Structures', description: 'Basic searching and sorting.' }
    ],
    totalLectures: 12,
    totalAssignments: 4,
    totalQuizzes: 2,
    progress: 35
};

const demoLectures = [
    { id: 'l1', moduleId: 'm1', title: '1.1 What is Computer Science?', duration: '15:20', videoId: 'dQw4w9WgXcQ', watched: true },
    { id: 'l2', moduleId: 'm1', title: '1.2 How Computers Work', duration: '22:10', videoId: 'dQw4w9WgXcQ', watched: false },
    { id: 'l3', moduleId: 'm2', title: '2.1 Introduction to Python', duration: '18:45', videoId: 'dQw4w9WgXcQ', watched: false }
];

const demoMaterials = [
    { id: 'mat1', title: 'Course Syllabus', type: 'pdf', size: 1024 * 500, url: '#' },
    { id: 'mat2', title: 'Python Cheat Sheet', type: 'pdf', size: 1024 * 1200, url: '#' },
    { id: 'mat3', title: 'Lecture 1 Slides', type: 'ppt', size: 1024 * 1024 * 5, url: '#' }
];

const demoAssignments = [
    { id: 'a1', title: 'Setup Your Development Environment', dueDate: Date.now() + 86400000 * 3, status: 'pending', points: 10 },
    { id: 'a2', title: 'Write Your First Program', dueDate: Date.now() + 86400000 * 7, status: 'submitted', points: 20, score: null }
];

const demoQuizzes = [
    { id: 'q1', title: 'Module 1 Quiz: Computing Basics', duration: 15, questionsCount: 10, status: 'completed', score: 85 },
    { id: 'q2', title: 'Module 2 Quiz: Programming Logic', duration: 20, questionsCount: 15, status: 'pending', score: null }
];

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    
    try {
        const authResult = await requireAuth();
        if (!authResult) return;
        currentUser = authResult.user;
        document.getElementById('authOverlay')?.classList.add('hidden');
        userProfile = authResult.profile || await getUserProfile(currentUser.uid);
        
        populateSidebarUser();
        
        // Handle logout
        document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logout();
            } catch (err) {
                console.error(err);
            }
        });

        // Get Course ID
        const urlParams = new URLSearchParams(window.location.search);
        currentCourseId = urlParams.get('id');
        
        await loadCourseData();

    } catch (error) {
        console.error("Auth check failed:", error);
    }
    
    // Setup Modals
    setupModals();
});

function populateSidebarUser() {
    const nameEl = document.getElementById('sidebarName');
    const roleEl = document.getElementById('sidebarRole');
    const avatarEl = document.getElementById('sidebarAvatar');
    
    const displayName = userProfile?.fullName || currentUser?.displayName || 'Student';
    const role = userProfile?.role === 'admin' ? 'Administrator' : 'Student';

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = role;
    if (avatarEl) {
        avatarEl.innerHTML = renderAvatar(displayName, 40);
    }
}

async function loadCourseData() {
    const container = document.getElementById('courseContent');
    showLoading(container, 'Loading course details...');
    
    let isDemo = false;
    let lectures = [], materials = [], assignments = [], quizzes = [];
    
    if (currentCourseId) {
        try {
            // Fetch from Firebase RTDB
            courseData = await getOne(`courses/${currentCourseId}`);
            if (courseData) {
                // Fetch related data
                const [lecSnap, matSnap, assSnap, quizSnap] = await Promise.all([
                    getWhere('lectures', 'courseId', currentCourseId),
                    getWhere('materials', 'courseId', currentCourseId),
                    getWhere('assignments', 'courseId', currentCourseId),
                    getWhere('quizzes', 'courseId', currentCourseId)
                ]);
                
                lectures = lecSnap || [];
                materials = matSnap || [];
                assignments = assSnap || [];
                quizzes = quizSnap || [];
                
                // Get progress
                const progData = await getOne(`progress/${currentUser.uid}/${currentCourseId}`);
                if (progData) {
                    courseData.progress = progData.percent || 0;
                } else {
                    courseData.progress = 0;
                }
            } else {
                isDemo = true;
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            showToast("Failed to load course from database, showing demo.", "error");
            isDemo = true;
        }
    } else {
        isDemo = true;
    }
    
    if (isDemo) {
        courseData = demoCourse;
        lectures = demoLectures;
        materials = demoMaterials;
        assignments = demoAssignments;
        quizzes = demoQuizzes;
    }

    renderCoursePage(container, lectures, materials, assignments, quizzes);
}

function renderCoursePage(container, lectures, materials, assignments, quizzes) {
    const colorClass = getSubjectColor(courseData.subject);
    const iconClass = getSubjectIcon(courseData.subject);
    
    // Group lectures by module
    const modulesHtml = (courseData.modules || []).map(m => `
        <li class="module-item">
            <div class="module-item__icon"><i class="fas fa-check-circle"></i></div>
            <div class="module-item__content">
                <h3>${escapeHtml(m.title || '')}</h3>
                <p>${escapeHtml(m.description || '')}</p>
            </div>
        </li>
    `).join('');

    // Lectures Tab
    let lecturesHtml = '<div class="lecture-list">';
    if (lectures.length > 0) {
        lecturesHtml += lectures.map(l => `
            <div class="lecture-item ${l.watched ? 'watched' : ''}" data-id="${l.id}">
                <div class="lecture-header">
                    <div class="lecture-info">
                        <div class="lecture-icon"><i class="fas ${l.watched ? 'fa-check' : 'fa-play'}"></i></div>
                        <div>
                            <h4 class="lecture-title">${escapeHtml(l.title || '')}</h4>
                            <div class="lecture-meta">
                                <span><i class="far fa-clock"></i> ${l.duration || '00:00'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="lecture-actions">
                        <button class="lms-btn lms-btn--sm ${l.watched ? 'lms-btn--outline' : 'lms-btn--primary'} toggle-watched-btn" data-id="${l.id}">
                            ${l.watched ? 'Mark Unwatched' : 'Mark Watched'}
                        </button>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="lecture-body">
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/${l.videoId || 'dQw4w9WgXcQ'}" allowfullscreen></iframe>
                    </div>
                    <p>${escapeHtml(l.description || 'No description available.')}</p>
                </div>
            </div>
        `).join('');
    } else {
        lecturesHtml += `<div class="lms-empty"><i class="fas fa-film fa-3x"></i><p>No lectures available yet.</p></div>`;
    }
    lecturesHtml += '</div>';

    // Materials Tab
    let materialsHtml = '<div class="materials-grid">';
    if (materials.length > 0) {
        materialsHtml += materials.map(m => {
            let icon = 'fa-file';
            if (m.type === 'pdf') icon = 'fa-file-pdf';
            if (m.type === 'doc' || m.type === 'docx') icon = 'fa-file-word';
            if (m.type === 'ppt' || m.type === 'pptx') icon = 'fa-file-powerpoint';
            if (m.type === 'xls' || m.type === 'xlsx') icon = 'fa-file-excel';
            if (m.type === 'zip' || m.type === 'rar') icon = 'fa-file-archive';

            return `
            <div class="material-card">
                <i class="fas ${icon} material-icon"></i>
                <h4 class="material-title" title="${escapeHtml(m.title || '')}">${escapeHtml(m.title || '')}</h4>
                <div class="material-meta">
                    <span class="lms-badge lms-badge--primary">${(m.type || 'file').toUpperCase()}</span>
                    <span>${formatFileSize(m.size || 0)}</span>
                </div>
                <a href="${m.url || '#'}" target="_blank" class="lms-btn lms-btn--outline lms-btn--sm lms-btn--block">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>`;
        }).join('');
    } else {
        materialsHtml += `<div class="lms-empty" style="grid-column: 1/-1"><i class="fas fa-folder-open fa-3x"></i><p>No materials available.</p></div>`;
    }
    materialsHtml += '</div>';

    // Assignments Tab
    let assignmentsHtml = '<div class="assignment-list">';
    if (assignments.length > 0) {
        assignmentsHtml += assignments.map(a => {
            const isSub = a.status === 'submitted' || a.status === 'graded';
            const dueDateVal = a.dueDate ? new Date(a.dueDate) : null;
            const dueDateStr = dueDateVal ? formatDate(dueDateVal) : 'No Due Date';
            return `
            <div class="assignment-card">
                <div class="assignment-info">
                    <h3>${escapeHtml(a.title || '')}</h3>
                    <div class="assignment-meta">
                        <span><i class="far fa-calendar-alt"></i> Due: ${dueDateStr}</span>
                        <span><i class="fas fa-star"></i> ${a.points || 0} pts</span>
                        <span class="lms-badge ${a.status==='graded'?'lms-badge--success':(a.status==='submitted'?'lms-badge--primary':'lms-badge--warning')}">${a.status || 'pending'}</span>
                    </div>
                </div>
                <div class="assignment-action">
                    ${!isSub ? 
                        `<button class="lms-btn lms-btn--primary lms-btn--sm submit-assignment-btn" data-id="${a.id}"><i class="fas fa-upload"></i> Submit</button>` :
                        (a.status==='graded' ? `<span class="lms-badge lms-badge--success">Score: ${a.score}/${a.points}</span>` : `<button class="lms-btn lms-btn--outline lms-btn--sm" disabled><i class="fas fa-check"></i> Submitted</button>`)
                    }
                </div>
            </div>`;
        }).join('');
    } else {
        assignmentsHtml += `<div class="lms-empty"><i class="fas fa-tasks fa-3x"></i><p>No assignments right now.</p></div>`;
    }
    assignmentsHtml += '</div>';

    // Quizzes Tab
    let quizzesHtml = '<div class="quiz-list">';
    if (quizzes.length > 0) {
        quizzesHtml += quizzes.map(q => {
            return `
            <div class="quiz-card">
                <div class="quiz-info">
                    <h3>${escapeHtml(q.title || '')}</h3>
                    <div class="quiz-meta">
                        <span><i class="far fa-clock"></i> ${q.duration || 0} mins</span>
                        <span><i class="fas fa-list-ol"></i> ${q.questionsCount || 0} Questions</span>
                        ${q.status==='completed' ? getScoreBadge(q.score) : `<span class="lms-badge lms-badge--warning">Pending</span>`}
                    </div>
                </div>
                <div class="quiz-action">
                    ${q.status === 'completed' ?
                        `<a href="quiz-result.html?id=${q.id}" class="lms-btn lms-btn--outline lms-btn--sm">Review</a>` :
                        `<a href="quiz.html?id=${q.id}" class="lms-btn lms-btn--primary lms-btn--sm"><i class="fas fa-play"></i> Start</a>`
                    }
                </div>
            </div>`;
        }).join('');
    } else {
        quizzesHtml += `<div class="lms-empty"><i class="fas fa-question-circle fa-3x"></i><p>No quizzes available.</p></div>`;
    }
    quizzesHtml += '</div>';

    container.innerHTML = `
        <div class="course-banner" style="background: var(--${colorClass})">
            <div class="course-banner__content">
                <div style="margin-bottom: 0.5rem;">
                    <span class="lms-badge" style="background: rgba(255,255,255,0.2); color: white;">${escapeHtml(courseData.subject || '')}</span>
                </div>
                <h1>${escapeHtml(courseData.title || '')}</h1>
                <p>${escapeHtml(courseData.description || '')}</p>
                
                <div class="course-stats">
                    <div class="course-stat"><i class="fas fa-film"></i> ${courseData.totalLectures || 0} Lectures</div>
                    <div class="course-stat"><i class="fas fa-tasks"></i> ${courseData.totalAssignments || 0} Assignments</div>
                    <div class="course-stat"><i class="fas fa-question-circle"></i> ${courseData.totalQuizzes || 0} Quizzes</div>
                </div>
                
                <div class="course-progress">
                    <div class="course-progress__bar" style="width: ${courseData.progress || 0}%"></div>
                </div>
                <div class="course-progress-text">${courseData.progress || 0}% Completed</div>
            </div>
            <i class="fas ${iconClass} course-banner__icon"></i>
        </div>

        <div class="lms-tabs">
            <div class="lms-tabs__header">
                <button class="lms-tab active" data-tab="overview">Overview</button>
                <button class="lms-tab" data-tab="lectures">Lectures</button>
                <button class="lms-tab" data-tab="materials">Notes & Materials</button>
                <button class="lms-tab" data-tab="assignments">Assignments</button>
                <button class="lms-tab" data-tab="quizzes">Quizzes</button>
            </div>

            <div class="lms-tabs__content">
                <div class="lms-tab-pane active" data-tab-pane="overview">
                    <div class="lms-card" style="margin-bottom: 2rem;">
                        <h2>About This Course</h2>
                        <p style="color: var(--text-muted); line-height: 1.6;">
                            ${escapeHtml(courseData.longDescription || courseData.description || '')}
                        </p>
                        
                        <h3 style="margin-top: 2rem;">Learning Objectives</h3>
                        <ul style="padding-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
                            ${(courseData.objectives || []).map(o => `<li>${escapeHtml(o)}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="lms-card">
                        <h2>Course Modules</h2>
                        <ul class="module-list">
                            ${modulesHtml || '<p>No modules listed.</p>'}
                        </ul>
                    </div>
                </div>

                <div class="lms-tab-pane" data-tab-pane="lectures">
                    ${lecturesHtml}
                </div>

                <div class="lms-tab-pane" data-tab-pane="materials">
                    ${materialsHtml}
                </div>

                <div class="lms-tab-pane" data-tab-pane="assignments">
                    ${assignmentsHtml}
                </div>

                <div class="lms-tab-pane" data-tab-pane="quizzes">
                    ${quizzesHtml}
                </div>
            </div>
        </div>
    `;

    initTabs(container);
    attachEventListeners();
}

function attachEventListeners() {
    // Lecture accordion toggle
    document.querySelectorAll('.lecture-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Prevent toggling if clicked on a button
            if(e.target.closest('button')) return;
            const item = header.closest('.lecture-item');
            item.classList.toggle('expanded');
        });
    });

    // Mark as watched toggle
    document.querySelectorAll('.toggle-watched-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // prevent accordion toggle
            const lectureId = btn.getAttribute('data-id');
            const item = btn.closest('.lecture-item');
            const isWatched = item.classList.contains('watched');
            
            // Optimistic UI update
            item.classList.toggle('watched');
            const icon = item.querySelector('.lecture-icon i');
            icon.className = isWatched ? 'fas fa-play' : 'fas fa-check';
            btn.textContent = isWatched ? 'Mark Watched' : 'Mark Unwatched';
            btn.className = `lms-btn lms-btn--sm ${isWatched ? 'lms-btn--primary' : 'lms-btn--outline'} toggle-watched-btn`;

            if (currentCourseId && !currentCourseId.startsWith('demo')) {
                try {
                    // Update user progress for this lecture
                    await setItem(`progress/${currentUser.uid}/${currentCourseId}/lectures/${lectureId}`, {
                        watched: !isWatched,
                        updatedAt: Date.now()
                    });
                    showToast(isWatched ? "Marked as unwatched" : "Marked as watched", "success");
                } catch (error) {
                    console.error("Error updating lecture status:", error);
                    showToast("Failed to update status", "error");
                    // Revert UI on failure
                    item.classList.toggle('watched');
                    icon.className = isWatched ? 'fas fa-check' : 'fas fa-play';
                    btn.textContent = isWatched ? 'Mark Unwatched' : 'Mark Watched';
                    btn.className = `lms-btn lms-btn--sm ${isWatched ? 'lms-btn--outline' : 'lms-btn--primary'} toggle-watched-btn`;
                }
            } else {
                showToast(isWatched ? "Marked as unwatched" : "Marked as watched", "success");
            }
        });
    });

    // Submit assignment modal
    document.querySelectorAll('.submit-assignment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assignmentId = btn.getAttribute('data-id');
            document.getElementById('submitAssignmentId').value = assignmentId;
            document.getElementById('submitComments').value = '';
            document.getElementById('submitFile').value = '';
            document.getElementById('submitModal').classList.add('active');
        });
    });

    document.querySelectorAll('.lms-modal, .lms-modal-backdrop').forEach(m => m.addEventListener('click', e => { if(e.target === m) m.classList.remove('active'); }));
}

function setupModals() {
    const modal = document.getElementById('submitModal');
    const closeBtn = document.getElementById('submitModalClose');
    const cancelBtn = document.getElementById('submitModalCancel');
    const saveBtn = document.getElementById('submitModalSave');

    const closeModal = () => {
        if (modal) modal.classList.remove('active');
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    saveBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const assignmentId = document.getElementById('submitAssignmentId').value;
        const comments = document.getElementById('submitComments').value;
        const fileInput = document.getElementById('submitFile');
        const file = fileInput?.files[0];

        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Submitting...';
        saveBtn.disabled = true;

        try {
            if (currentCourseId && !currentCourseId.startsWith('demo')) {
                let fileUrl = null;
                if (file) {
                    const sRef = storageRef(storage, `submissions/${currentUser.uid}/${assignmentId}/${file.name}`);
                    await uploadBytes(sRef, file);
                    fileUrl = await getDownloadURL(sRef);
                }

                await setItem(`submissions/${currentUser.uid}_${assignmentId}`, {
                    userId: currentUser.uid,
                    assignmentId: assignmentId,
                    courseId: currentCourseId,
                    comments: comments,
                    fileUrl: fileUrl,
                    fileName: file?.name || null,
                    submittedAt: Date.now(),
                    status: 'submitted'
                });
            }
            
            showToast('Assignment submitted successfully', 'success');
            closeModal();
            loadCourseData(); // Optional: refresh data
        } catch (error) {
            console.error("Error submitting assignment:", error);
            showToast('Failed to submit assignment', 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });
}
