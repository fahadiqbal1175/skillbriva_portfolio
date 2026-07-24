import {
  auth, db, storage,
  ref, get, set, update, remove, push, onValue, off,
  getAll, getOne, getWhere, pushItem, setItem, updateItem, removeItem, listen,
  snapshotToArray,
  storageRef, uploadBytes, getDownloadURL, deleteObject,
  requireAdmin, getUserProfile, logout
} from './firebase-config.js';
import { 
    showToast, showModal, showConfirm, showLoading, showEmpty, initSidebar, initTabs, formatDate, formatDateTime, timeAgo, getInitials, getSubjectIcon, getSubjectColor, formatFileSize, getScoreBadge, renderAvatar, escapeHtml, truncate 
} from './lms-common.js';

// DOM Elements
const adminName = document.getElementById('admin-name');
const adminAvatarContainer = document.getElementById('admin-avatar-container');
const topbarAvatarContainer = document.getElementById('topbar-avatar-container');
const btnLogout = document.getElementById('btn-logout');

// Global state
let coursesList = [];

// Initialize Admin Panel
async function initAdmin() {
    try {
        const user = await requireAdmin();
        
        // Setup User Info
        adminName.textContent = user.displayName || 'Admin User';
        adminAvatarContainer.innerHTML = renderAvatar(user.displayName, 40);
        topbarAvatarContainer.innerHTML = renderAvatar(user.displayName, 32);

        // Init Common UI
        initSidebar();
        initTabs();

        // Setup Logout
        btnLogout.addEventListener('click', async () => {
            await logout();
            window.location.href = 'login.html';
        });

        // Load Initial Data
        await fetchCourses(); // Needed for dropdowns
        setupModals();
        
        // Listeners for Tabs
        document.querySelectorAll('.lms-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                loadTabData(tabName);
            });
        });

        // Load active tab data (Dashboard)
        loadTabData('dashboard');

    } catch (error) {
        console.error("Admin init error:", error);
    }
}

// ----------------------------------------------------------------------
// DATA LOADING & ROUTING
// ----------------------------------------------------------------------
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard': loadDashboard(); break;
        case 'students': loadStudents(); break;
        case 'courses': loadCoursesTab(); break;
        case 'assignments': loadAssignments(); break;
        case 'quizzes': loadQuizzes(); break;
        case 'lectures': loadLectures(); break;
        case 'materials': loadMaterials(); break;
        case 'live': loadLiveClasses(); break;
        case 'analytics': loadAnalytics(); break;
    }
}

async function fetchCourses() {
    coursesList = await getAll('courses');
    coursesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    populateCourseDropdowns();
}

function populateCourseDropdowns() {
    const dropdowns = ['course', 'assignment-course', 'quiz-course', 'lecture-course', 'material-course', 'live-course'];
    const filterDropdowns = ['assignments-course-filter', 'quizzes-course-filter', 'lectures-course-filter', 'materials-course-filter', 'live-course-filter'];

    const optionsHTML = '<option value="">Select Course</option>' + coursesList.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');
    const filterOptionsHTML = '<option value="all">All Courses</option>' + coursesList.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');

    dropdowns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = optionsHTML;
    });

    filterDropdowns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = filterOptionsHTML;
    });
}

// ----------------------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------------------
async function loadDashboard() {
    // Stat counters
    const students = await getWhere('users', 'role', 'student');
    document.getElementById('stat-students').textContent = students.length;

    document.getElementById('stat-courses').textContent = coursesList.length;

    const pendingStudents = students.filter(s => s.status === 'pending');
    document.getElementById('stat-pending').textContent = pendingStudents.length;

    const quizzes = await getAll('quizzes');
    document.getElementById('stat-quizzes').textContent = quizzes.length;

    // Pending Students Table
    const tbody = document.querySelector('#pending-students-table tbody');
    tbody.innerHTML = '';
    
    if (pendingStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No pending approvals</td></tr>';
        return;
    }

    pendingStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    ${renderAvatar(student.displayName, 32)}
                    <span>${escapeHtml(student.displayName || 'Unknown')}</span>
                </div>
            </td>
            <td>${escapeHtml(student.email)}</td>
            <td>${formatDate(student.createdAt)}</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--success" onclick="approveStudent('${student.id}')">Approve</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.approveStudent = async (uid) => {
    try {
        await updateItem('users/' + uid, { status: 'active' });
        showToast('Student approved successfully', 'success');
        loadDashboard();
        if (document.querySelector('.lms-tab-pane[data-tab-pane="students"]').classList.contains('active')) {
            loadStudents();
        }
    } catch (e) {
        showToast('Error approving student', 'error');
    }
}

// ----------------------------------------------------------------------
// STUDENTS TAB
// ----------------------------------------------------------------------
async function loadStudents() {
    const tbody = document.querySelector('#all-students-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const filter = document.getElementById('students-filter').value;
    const search = document.getElementById('students-search').value.toLowerCase();
    
    let students = await getWhere('users', 'role', 'student');
    
    if (filter !== 'all') {
        students = students.filter(s => s.status === filter);
    }
    
    if (search) {
        students = students.filter(s => (s.displayName||'').toLowerCase().includes(search) || s.email.toLowerCase().includes(search));
    }
    
    tbody.innerHTML = '';
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students found</td></tr>';
        return;
    }

    students.forEach(student => {
        const tr = document.createElement('tr');
        let statusBadge = '';
        if (student.status === 'active') statusBadge = '<span class="lms-badge lms-badge--success">Active</span>';
        else if (student.status === 'pending') statusBadge = '<span class="lms-badge lms-badge--warning">Pending</span>';
        else statusBadge = '<span class="lms-badge lms-badge--danger">Suspended</span>';
        
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    ${renderAvatar(student.displayName, 32)}
                    <span>${escapeHtml(student.displayName || 'Unknown')}</span>
                </div>
            </td>
            <td>${escapeHtml(student.email)}</td>
            <td>${formatDate(student.createdAt)}</td>
            <td>${statusBadge}</td>
            <td>
                ${student.status !== 'active' ? `<button class="lms-btn lms-btn--sm lms-btn--success" onclick="approveStudent('${student.id}')">Approve</button>` : ''}
                ${student.status === 'active' ? `<button class="lms-btn lms-btn--sm lms-btn--danger" onclick="suspendStudent('${student.id}')">Suspend</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.suspendStudent = async (uid) => {
    try {
        await updateItem('users/' + uid, { status: 'suspended' });
        showToast('Student suspended', 'success');
        loadStudents();
    } catch (e) {
        showToast('Error suspending student', 'error');
    }
}

document.getElementById('students-search').addEventListener('input', loadStudents);
document.getElementById('students-filter').addEventListener('change', loadStudents);

// ----------------------------------------------------------------------
// COURSES TAB
// ----------------------------------------------------------------------
async function loadCoursesTab() {
    await fetchCourses();
    const grid = document.getElementById('courses-grid');
    const search = document.getElementById('courses-search').value.toLowerCase();
    
    grid.innerHTML = '';
    
    const filtered = coursesList.filter(c => c.title.toLowerCase().includes(search));
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p>No courses found.</p>';
        return;
    }
    
    filtered.forEach(course => {
        const card = document.createElement('div');
        card.className = 'lms-course-card';
        card.innerHTML = `
            <div class="lms-course-card__icon" style="background: var(--${getSubjectColor(course.subject)}-light); color: var(--${getSubjectColor(course.subject)}); font-size: 2rem; padding: 1rem; text-align: center; border-radius: 8px 8px 0 0;">
                <i class="fas ${getSubjectIcon(course.subject)}"></i>
            </div>
            <div class="lms-course-card__content" style="padding: 1rem;">
                <h3 style="margin-bottom: 0.5rem;">${escapeHtml(course.title)}</h3>
                <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">${escapeHtml(course.subject)}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="lms-badge ${course.published ? 'lms-badge--success' : 'lms-badge--warning'}">${course.published ? 'Published' : 'Draft'}</span>
                    <div>
                        <button class="lms-btn lms-btn--sm lms-btn--ghost" onclick="editCourse('${course.id}')"><i class="fas fa-edit"></i></button>
                        <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteCourse('${course.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
document.getElementById('courses-search').addEventListener('input', loadCoursesTab);

// ----------------------------------------------------------------------
// ASSIGNMENTS TAB
// ----------------------------------------------------------------------
async function loadAssignments() {
    const tbody = document.querySelector('#assignments-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const courseId = document.getElementById('assignments-course-filter').value;
    let assignments = await getAll('assignments');
    
    if (courseId !== 'all') {
        assignments = assignments.filter(a => a.courseId === courseId);
    }
    assignments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    tbody.innerHTML = '';
    if (assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No assignments found</td></tr>';
        return;
    }
    
    assignments.forEach(a => {
        const course = coursesList.find(c => c.id === a.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(a.title)}</td>
            <td>${escapeHtml(course ? course.title : 'Unknown')}</td>
            <td>${formatDate(a.dueDate)}</td>
            <td>${a.submissionCount || 0}</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--primary" onclick="viewSubmissions('${a.id}', '${a.points}')">Submissions</button>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" onclick="editAssignment('${a.id}')"><i class="fas fa-edit"></i></button>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteDocHandler('assignments', '${a.id}', loadAssignments)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('assignments-course-filter').addEventListener('change', loadAssignments);

// ----------------------------------------------------------------------
// QUIZZES TAB
// ----------------------------------------------------------------------
async function loadQuizzes() {
    const tbody = document.querySelector('#quizzes-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const courseId = document.getElementById('quizzes-course-filter').value;
    let quizzes = await getAll('quizzes');
    
    if (courseId !== 'all') {
        quizzes = quizzes.filter(q => q.courseId === courseId);
    }
    quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    tbody.innerHTML = '';
    if (quizzes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No quizzes found</td></tr>';
        return;
    }
    
    quizzes.forEach(qz => {
        const course = coursesList.find(c => c.id === qz.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(qz.title)}</td>
            <td>${escapeHtml(course ? course.title : 'Unknown')}</td>
            <td>${qz.questions ? qz.questions.length : 0}</td>
            <td>${qz.duration} mins</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" onclick="editQuiz('${qz.id}')"><i class="fas fa-edit"></i></button>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteDocHandler('quizzes', '${qz.id}', loadQuizzes)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('quizzes-course-filter').addEventListener('change', loadQuizzes);

// ----------------------------------------------------------------------
// LECTURES TAB
// ----------------------------------------------------------------------
async function loadLectures() {
    const tbody = document.querySelector('#lectures-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const courseId = document.getElementById('lectures-course-filter').value;
    let lectures = await getAll('lectures');
    
    if (courseId !== 'all') {
        lectures = lectures.filter(l => l.courseId === courseId);
    }
    lectures.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    tbody.innerHTML = '';
    if (lectures.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No lectures found</td></tr>';
        return;
    }
    
    lectures.forEach(l => {
        const course = coursesList.find(c => c.id === l.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(l.title)}</td>
            <td>${escapeHtml(course ? course.title : 'Unknown')}</td>
            <td>${escapeHtml(l.module)}</td>
            <td><span class="lms-badge ${l.published ? 'lms-badge--success' : 'lms-badge--warning'}">${l.published ? 'Published' : 'Draft'}</span></td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" onclick="editLecture('${l.id}')"><i class="fas fa-edit"></i></button>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteDocHandler('lectures', '${l.id}', loadLectures)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('lectures-course-filter').addEventListener('change', loadLectures);

// ----------------------------------------------------------------------
// MATERIALS TAB
// ----------------------------------------------------------------------
async function loadMaterials() {
    const tbody = document.querySelector('#materials-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const courseId = document.getElementById('materials-course-filter').value;
    let materials = await getAll('materials');
    
    if (courseId !== 'all') {
        materials = materials.filter(m => m.courseId === courseId);
    }
    materials.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    tbody.innerHTML = '';
    if (materials.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No materials found</td></tr>';
        return;
    }
    
    materials.forEach(m => {
        const course = coursesList.find(c => c.id === m.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <i class="fas fa-file-alt" style="margin-right: 0.5rem; color: var(--primary);"></i>
                <a href="${escapeHtml(m.fileUrl)}" target="_blank" style="color: inherit; text-decoration: none;">${escapeHtml(m.title)}</a>
            </td>
            <td>${escapeHtml(course ? course.title : 'Unknown')}</td>
            <td>${formatFileSize(m.size)}</td>
            <td>${formatDate(m.createdAt)}</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteDocHandler('materials', '${m.id}', loadMaterials)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('materials-course-filter').addEventListener('change', loadMaterials);

// ----------------------------------------------------------------------
// LIVE CLASSES TAB
// ----------------------------------------------------------------------
async function loadLiveClasses() {
    const tbody = document.querySelector('#live-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    const courseId = document.getElementById('live-course-filter').value;
    let liveClasses = await getAll('liveClasses');
    
    if (courseId !== 'all') {
        liveClasses = liveClasses.filter(l => l.courseId === courseId);
    }
    // Sort by date/time descending
    liveClasses.sort((a, b) => {
        const d1 = new Date(b.date + 'T' + (b.time || '00:00')).getTime();
        const d2 = new Date(a.date + 'T' + (a.time || '00:00')).getTime();
        return d1 - d2;
    });
    
    tbody.innerHTML = '';
    if (liveClasses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No live classes found</td></tr>';
        return;
    }
    
    liveClasses.forEach(l => {
        const course = coursesList.find(c => c.id === l.courseId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(l.topic)}</td>
            <td>${escapeHtml(course ? course.title : 'Unknown')}</td>
            <td>${escapeHtml(l.date)} ${escapeHtml(l.time)}</td>
            <td>${escapeHtml(l.platform)}</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" onclick="editLive('${l.id}')"><i class="fas fa-edit"></i></button>
                <button class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger)" onclick="deleteDocHandler('liveClasses', '${l.id}', loadLiveClasses)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('live-course-filter').addEventListener('change', loadLiveClasses);

// ----------------------------------------------------------------------
// ANALYTICS TAB
// ----------------------------------------------------------------------
let charts = [];
async function loadAnalytics() {
    // Destroy previous charts if they exist
    charts.forEach(c => c.destroy());
    charts = [];

    // Dummy data for charts since we don't have enough history
    const ctxEnrolls = document.getElementById('chart-enrollments').getContext('2d');
    charts.push(new Chart(ctxEnrolls, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Enrollments',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#10b981',
                tension: 0.1
            }]
        }
    }));

    const ctxCourses = document.getElementById('chart-courses').getContext('2d');
    charts.push(new Chart(ctxCourses, {
        type: 'doughnut',
        data: {
            labels: ['Quran', 'Programming', 'Science', 'Math'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: ['#10b981', '#a855f7', '#0ea5e9', '#f59e0b']
            }]
        }
    }));

    const ctxQuizzes = document.getElementById('chart-quizzes').getContext('2d');
    charts.push(new Chart(ctxQuizzes, {
        type: 'bar',
        data: {
            labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
            datasets: [{
                label: 'Average Score (%)',
                data: [85, 72, 90, 68],
                backgroundColor: '#3b82f6'
            }]
        }
    }));
}

// ----------------------------------------------------------------------
// MODALS & FORMS SETUP
// ----------------------------------------------------------------------
function setupModals() {
    // Open Buttons
    document.getElementById('btn-add-course').addEventListener('click', () => {
        document.getElementById('form-course').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('course-modal-title').textContent = 'Add Course';
        document.getElementById('modal-course').classList.add('active');
    });

    document.getElementById('btn-add-assignment').addEventListener('click', () => {
        document.getElementById('form-assignment').reset();
        document.getElementById('assignment-id').value = '';
        document.getElementById('assignment-modal-title').textContent = 'Create Assignment';
        document.getElementById('modal-assignment').classList.add('active');
    });

    document.getElementById('btn-add-quiz').addEventListener('click', () => {
        document.getElementById('form-quiz').reset();
        document.getElementById('quiz-id').value = '';
        document.getElementById('quiz-questions-container').innerHTML = '';
        document.getElementById('quiz-modal-title').textContent = 'Create Quiz';
        document.getElementById('modal-quiz').classList.add('active');
    });

    document.getElementById('btn-add-lecture').addEventListener('click', () => {
        document.getElementById('form-lecture').reset();
        document.getElementById('lecture-id').value = '';
        document.getElementById('lecture-modal-title').textContent = 'Add Lecture';
        document.getElementById('modal-lecture').classList.add('active');
    });

    document.getElementById('btn-add-material').addEventListener('click', () => {
        document.getElementById('form-material').reset();
        document.getElementById('modal-material').classList.add('active');
    });

    document.getElementById('btn-add-live').addEventListener('click', () => {
        document.getElementById('form-live').reset();
        document.getElementById('live-id').value = '';
        document.getElementById('live-modal-title').textContent = 'Schedule Class';
        document.getElementById('modal-live').classList.add('active');
    });

    // Save Buttons
    document.getElementById('btn-save-course').addEventListener('click', saveCourse);
    document.getElementById('btn-save-assignment').addEventListener('click', saveAssignment);
    document.getElementById('btn-save-quiz').addEventListener('click', saveQuiz);
    document.getElementById('btn-save-lecture').addEventListener('click', saveLecture);
    document.getElementById('btn-save-material').addEventListener('click', saveMaterial);
    document.getElementById('btn-save-live').addEventListener('click', saveLive);
    document.getElementById('btn-save-grade').addEventListener('click', saveGrade);

    // Quiz Builder
    document.getElementById('btn-add-question').addEventListener('click', () => addQuestionToQuiz());
}

// ----------------------------------------------------------------------
// SAVE FUNCTIONS
// ----------------------------------------------------------------------

async function saveCourse(e) {
    e.preventDefault();
    const id = document.getElementById('course-id').value;
    const data = {
        title: document.getElementById('course-title').value,
        subject: document.getElementById('course-subject').value,
        description: document.getElementById('course-desc').value,
        published: document.getElementById('course-published').checked,
        updatedAt: Date.now()
    };
    
    if(!data.title || !data.subject) return showToast('Title and subject required', 'error');

    try {
        if (id) {
            await updateItem('courses/' + id, data);
            showToast('Course updated', 'success');
        } else {
            data.createdAt = Date.now();
            data.studentCount = 0;
            await pushItem('courses', data);
            showToast('Course created', 'success');
        }
        document.getElementById('modal-course').classList.remove('active');
        loadCoursesTab();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

window.editCourse = async (id) => {
    const data = await getOne('courses/' + id);
    if(!data) return;
    
    document.getElementById('course-id').value = id;
    document.getElementById('course-title').value = data.title || '';
    document.getElementById('course-subject').value = data.subject || '';
    document.getElementById('course-desc').value = data.description || '';
    document.getElementById('course-published').checked = data.published || false;
    
    document.getElementById('course-modal-title').textContent = 'Edit Course';
    document.getElementById('modal-course').classList.add('active');
}

async function saveAssignment(e) {
    e.preventDefault();
    const id = document.getElementById('assignment-id').value;
    const data = {
        courseId: document.getElementById('assignment-course').value,
        title: document.getElementById('assignment-title').value,
        description: document.getElementById('assignment-desc').value,
        dueDate: document.getElementById('assignment-due').value,
        points: parseInt(document.getElementById('assignment-points').value) || 100,
        updatedAt: Date.now()
    };
    
    if(!data.title || !data.courseId) return showToast('Course and Title required', 'error');

    try {
        if (id) {
            await updateItem('assignments/' + id, data);
            showToast('Assignment updated', 'success');
        } else {
            data.createdAt = Date.now();
            data.submissionCount = 0;
            await pushItem('assignments', data);
            showToast('Assignment created', 'success');
        }
        document.getElementById('modal-assignment').classList.remove('active');
        loadAssignments();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

window.editAssignment = async (id) => {
    const data = await getOne('assignments/' + id);
    if(!data) return;
    
    document.getElementById('assignment-id').value = id;
    document.getElementById('assignment-course').value = data.courseId || '';
    document.getElementById('assignment-title').value = data.title || '';
    document.getElementById('assignment-desc').value = data.description || '';
    document.getElementById('assignment-due').value = data.dueDate || '';
    document.getElementById('assignment-points').value = data.points || 100;
    
    document.getElementById('assignment-modal-title').textContent = 'Edit Assignment';
    document.getElementById('modal-assignment').classList.add('active');
}

async function saveLecture(e) {
    e.preventDefault();
    const id = document.getElementById('lecture-id').value;
    const data = {
        courseId: document.getElementById('lecture-course').value,
        module: document.getElementById('lecture-module').value,
        title: document.getElementById('lecture-title').value,
        videoUrl: document.getElementById('lecture-url').value,
        duration: document.getElementById('lecture-duration').value,
        published: document.getElementById('lecture-published').checked,
        updatedAt: Date.now()
    };
    
    if(!data.title || !data.courseId || !data.videoUrl) return showToast('Fill all required fields', 'error');

    try {
        if (id) {
            await updateItem('lectures/' + id, data);
            showToast('Lecture updated', 'success');
        } else {
            data.createdAt = Date.now();
            await pushItem('lectures', data);
            showToast('Lecture added', 'success');
        }
        document.getElementById('modal-lecture').classList.remove('active');
        loadLectures();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

window.editLecture = async (id) => {
    const data = await getOne('lectures/' + id);
    if(!data) return;
    
    document.getElementById('lecture-id').value = id;
    document.getElementById('lecture-course').value = data.courseId || '';
    document.getElementById('lecture-module').value = data.module || '';
    document.getElementById('lecture-title').value = data.title || '';
    document.getElementById('lecture-url').value = data.videoUrl || '';
    document.getElementById('lecture-duration').value = data.duration || '';
    document.getElementById('lecture-published').checked = data.published || false;
    
    document.getElementById('lecture-modal-title').textContent = 'Edit Lecture';
    document.getElementById('modal-lecture').classList.add('active');
}

async function saveMaterial(e) {
    e.preventDefault();
    const courseId = document.getElementById('material-course').value;
    const title = document.getElementById('material-title').value;
    const desc = document.getElementById('material-desc').value;
    const fileInput = document.getElementById('material-file');
    
    if(!courseId || !title || !fileInput.files.length) return showToast('Course, Title, and File required', 'error');

    const file = fileInput.files[0];
    const sRef = storageRef(storage, `materials/${courseId}/${Date.now()}_${file.name}`);
    
    try {
        const btn = document.getElementById('btn-save-material');
        btn.textContent = 'Uploading...';
        btn.disabled = true;

        await uploadBytes(sRef, file);
        const url = await getDownloadURL(sRef);

        await pushItem('materials', {
            courseId, title, description: desc,
            fileUrl: url, fileName: file.name,
            size: file.size, type: file.type,
            createdAt: Date.now()
        });

        showToast('Material uploaded successfully', 'success');
        document.getElementById('modal-material').classList.remove('active');
        loadMaterials();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        const btn = document.getElementById('btn-save-material');
        btn.textContent = 'Upload';
        btn.disabled = false;
    }
}

async function saveLive(e) {
    e.preventDefault();
    const id = document.getElementById('live-id').value;
    const data = {
        courseId: document.getElementById('live-course').value,
        topic: document.getElementById('live-topic').value,
        date: document.getElementById('live-date').value,
        time: document.getElementById('live-time').value,
        platform: document.getElementById('live-platform').value,
        joinUrl: document.getElementById('live-link').value,
        updatedAt: Date.now()
    };
    
    if(!data.topic || !data.courseId || !data.date) return showToast('Fill all required fields', 'error');

    try {
        if (id) {
            await updateItem('liveClasses/' + id, data);
            showToast('Class updated', 'success');
        } else {
            data.createdAt = Date.now();
            await pushItem('liveClasses', data);
            showToast('Class scheduled', 'success');
        }
        document.getElementById('modal-live').classList.remove('active');
        loadLiveClasses();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

window.editLive = async (id) => {
    const data = await getOne('liveClasses/' + id);
    if(!data) return;
    
    document.getElementById('live-id').value = id;
    document.getElementById('live-course').value = data.courseId || '';
    document.getElementById('live-topic').value = data.topic || '';
    document.getElementById('live-date').value = data.date || '';
    document.getElementById('live-time').value = data.time || '';
    document.getElementById('live-platform').value = data.platform || '';
    document.getElementById('live-link').value = data.joinUrl || '';
    
    document.getElementById('live-modal-title').textContent = 'Edit Class';
    document.getElementById('modal-live').classList.add('active');
}

// ----------------------------------------------------------------------
// QUIZ BUILDER LOGIC
// ----------------------------------------------------------------------
let questionCount = 0;

function addQuestionToQuiz(qData = null) {
    const container = document.getElementById('quiz-questions-container');
    const qId = \`q_\${Date.now()}_\${Math.floor(Math.random()*1000)}\`;
    
    const card = document.createElement('div');
    card.className = 'quiz-question-card';
    card.id = \`card_\${qId}\`;
    
    const isMCQ = !qData || qData.type === 'mcq';
    
    card.innerHTML = \`
        <div class="quiz-question-header">
            <strong>Question \${container.children.length + 1}</strong>
            <button type="button" class="lms-btn lms-btn--sm lms-btn--ghost" style="color:var(--danger);" onclick="document.getElementById('card_\${qId}').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="lms-form-group">
            <textarea class="lms-textarea q-text" rows="2" placeholder="Question Text" required>\${qData ? escapeHtml(qData.text) : ''}</textarea>
        </div>
        <div class="lms-form-row">
            <div class="lms-form-group" style="flex:1;">
                <label>Type</label>
                <select class="lms-select q-type" onchange="toggleQType('\${qId}')">
                    <option value="mcq" \${qData && qData.type === 'mcq' ? 'selected' : ''}>Multiple Choice</option>
                    <option value="tf" \${qData && qData.type === 'tf' ? 'selected' : ''}>True/False</option>
                    <option value="short" \${qData && qData.type === 'short' ? 'selected' : ''}>Short Answer</option>
                </select>
            </div>
            <div class="lms-form-group" style="flex:1;">
                <label>Points</label>
                <input type="number" class="lms-input q-points" value="\${qData ? qData.points : 1}" min="1" required>
            </div>
        </div>
        <div class="q-options-container" id="options_\${qId}" style="\${isMCQ ? '' : 'display:none;'}">
            <label>Options (Select correct answer)</label>
            \${[0,1,2,3].map(i => \`
                <div class="quiz-option-row">
                    <input type="radio" name="correct_\${qId}" value="\${i}" \${qData && qData.correctOption === i ? 'checked' : (i===0?'checked':'')}>
                    <input type="text" class="lms-input q-option-val" placeholder="Option \${i+1}" value="\${qData && qData.options ? escapeHtml(qData.options[i]||'') : ''}">
                </div>
            \`).join('')}
        </div>
        <div class="q-tf-container" id="tf_\${qId}" style="\${qData && qData.type === 'tf' ? '' : 'display:none;'}">
            <label>Correct Answer</label>
            <select class="lms-select q-tf-val">
                <option value="true" \${qData && qData.correctOption === 'true' ? 'selected' : ''}>True</option>
                <option value="false" \${qData && qData.correctOption === 'false' ? 'selected' : ''}>False</option>
            </select>
        </div>
        <div class="q-short-container" id="short_\${qId}" style="\${qData && qData.type === 'short' ? '' : 'display:none;'}">
            <label>Correct Answer (Exact match)</label>
            <input type="text" class="lms-input q-short-val" value="\${qData && qData.type === 'short' ? escapeHtml(qData.correctOption || '') : ''}">
        </div>
    \`;
    container.appendChild(card);
}

window.toggleQType = (qId) => {
    const type = document.querySelector(\`#card_\${qId} .q-type\`).value;
    document.getElementById(\`options_\${qId}\`).style.display = type === 'mcq' ? 'block' : 'none';
    document.getElementById(\`tf_\${qId}\`).style.display = type === 'tf' ? 'block' : 'none';
    document.getElementById(\`short_\${qId}\`).style.display = type === 'short' ? 'block' : 'none';
}

async function saveQuiz(e) {
    e.preventDefault();
    const id = document.getElementById('quiz-id').value;
    
    // Build Questions Array
    const cards = document.querySelectorAll('.quiz-question-card');
    const questions = [];
    let hasError = false;

    cards.forEach(card => {
        const type = card.querySelector('.q-type').value;
        const text = card.querySelector('.q-text').value;
        const points = parseInt(card.querySelector('.q-points').value) || 1;
        
        if(!text) hasError = true;

        let qObj = { id: 'q'+Math.random().toString(36).substr(2, 9), type, text, points };

        if (type === 'mcq') {
            const opts = Array.from(card.querySelectorAll('.q-option-val')).map(inp => inp.value);
            const correctRadio = card.querySelector(\`input[type="radio"]:checked\`);
            if(!correctRadio || opts.some(o => !o)) hasError = true;
            qObj.options = opts;
            qObj.correctOption = parseInt(correctRadio.value);
        } else if (type === 'tf') {
            qObj.correctOption = card.querySelector('.q-tf-val').value;
        } else if (type === 'short') {
            qObj.correctOption = card.querySelector('.q-short-val').value;
            if(!qObj.correctOption) hasError = true;
        }

        questions.push(qObj);
    });

    if(hasError) return showToast('Please fill all question details', 'error');
    if(questions.length === 0) return showToast('Add at least one question', 'error');

    const data = {
        courseId: document.getElementById('quiz-course').value,
        title: document.getElementById('quiz-title').value,
        duration: parseInt(document.getElementById('quiz-duration').value),
        passingScore: parseInt(document.getElementById('quiz-passing').value),
        randomizeQuestions: document.getElementById('quiz-random-q').checked,
        randomizeOptions: document.getElementById('quiz-random-o').checked,
        questions: questions,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        updatedAt: Date.now()
    };

    try {
        if (id) {
            await updateItem('quizzes/' + id, data);
            showToast('Quiz updated', 'success');
        } else {
            data.createdAt = Date.now();
            await pushItem('quizzes', data);
            showToast('Quiz created', 'success');
        }
        document.getElementById('modal-quiz').classList.remove('active');
        loadQuizzes();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

window.editQuiz = async (id) => {
    const data = await getOne('quizzes/' + id);
    if(!data) return;
    
    document.getElementById('quiz-id').value = id;
    document.getElementById('quiz-course').value = data.courseId || '';
    document.getElementById('quiz-title').value = data.title || '';
    document.getElementById('quiz-duration').value = data.duration || 30;
    document.getElementById('quiz-passing').value = data.passingScore || 60;
    document.getElementById('quiz-random-q').checked = data.randomizeQuestions || false;
    document.getElementById('quiz-random-o').checked = data.randomizeOptions || false;
    
    const container = document.getElementById('quiz-questions-container');
    container.innerHTML = '';
    (data.questions || []).forEach(q => addQuestionToQuiz(q));
    
    document.getElementById('quiz-modal-title').textContent = 'Edit Quiz';
    document.getElementById('modal-quiz').classList.add('active');
}

// ----------------------------------------------------------------------
// GRADING SUBMISSIONS
// ----------------------------------------------------------------------
window.viewSubmissions = async (assignmentId, maxPoints) => {
    document.getElementById('modal-submissions').classList.add('active');
    const tbody = document.querySelector('#submissions-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    
    let submissions = await getWhere('submissions', 'assignmentId', 'assignmentId');
    // NOTE: above query might need to filter manually since we might not have index
    submissions = await getAll('submissions');
    submissions = submissions.filter(s => s.assignmentId === assignmentId);
    
    tbody.innerHTML = '';
    if (submissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No submissions yet</td></tr>';
        return;
    }
    
    submissions.forEach(sub => {
        const tr = document.createElement('tr');
        
        let content = '';
        if(sub.fileUrl) content = \`<a href="\${escapeHtml(sub.fileUrl)}" target="_blank"><i class="fas fa-file-download"></i> Download</a>\`;
        else if(sub.text) content = \`<button class="lms-btn lms-btn--sm" onclick="alert('\${escapeHtml(sub.text.replace(/'/g, "\\\\\\'"))}')">View Text</button>\`;
        
        tr.innerHTML = \`
            <td>\${escapeHtml(sub.studentName || 'Student')}</td>
            <td>\${formatDate(sub.submittedAt)}</td>
            <td>\${content}</td>
            <td>\${sub.grade ? \`\${sub.grade}/\${maxPoints}\` : '<span class="lms-badge lms-badge--warning">Not Graded</span>'}</td>
            <td>
                <button class="lms-btn lms-btn--sm lms-btn--primary" onclick="openGradeModal('\${sub.id}', \${maxPoints}, \${sub.grade || 0}, '\${escapeHtml((sub.feedback || '').replace(/'/g, "\\\\'"))}')">Grade</button>
            </td>
        \`;
        tbody.appendChild(tr);
    });
}

window.openGradeModal = (subId, max, currentScore, feedback) => {
    document.getElementById('grade-submission-id').value = subId;
    document.getElementById('grade-max-points').textContent = max;
    document.getElementById('grade-score').max = max;
    document.getElementById('grade-score').value = currentScore;
    document.getElementById('grade-feedback').value = feedback || '';
    document.getElementById('modal-grade').classList.add('active');
}

async function saveGrade(e) {
    e.preventDefault();
    const subId = document.getElementById('grade-submission-id').value;
    const score = parseInt(document.getElementById('grade-score').value);
    const feedback = document.getElementById('grade-feedback').value;
    
    try {
        await updateItem('submissions/' + subId, {
            grade: score,
            feedback: feedback,
            gradedAt: Date.now()
        });
        showToast('Grade saved', 'success');
        document.getElementById('modal-grade').classList.remove('active');
        // Refresh submissions (hacky way without storing assignment id globally)
        document.getElementById('modal-submissions').classList.remove('active'); 
    } catch(err) {
        showToast(err.message, 'error');
    }
}

// ----------------------------------------------------------------------
// DELETE HELPER
// ----------------------------------------------------------------------
window.deleteDocHandler = async (collectionName, id, callback) => {
    showConfirm('Delete Item', 'Are you sure you want to delete this item? This cannot be undone.', async () => {
        try {
            await removeItem(collectionName + '/' + id);
            showToast('Item deleted', 'success');
            if(callback) callback();
        } catch(err) {
            showToast('Error deleting item', 'error');
        }
    });
}
window.deleteCourse = (id) => window.deleteDocHandler('courses', id, loadCoursesTab);

// Initialize on load
document.addEventListener('DOMContentLoaded', initAdmin);
