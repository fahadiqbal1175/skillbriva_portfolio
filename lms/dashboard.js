import { 
    auth, db, storage, 
    updatePassword, 
    getAll, getOne, getWhere, pushItem, setItem, updateItem, 
    storageRef, uploadBytes, getDownloadURL, 
    getCurrentUser, requireAuth, logout 
} from './firebase-config.js';
import { 
    showToast, showLoading, showEmpty, initSidebar, initTabs, 
    formatDate, formatDateTime, getInitials, getSubjectIcon, 
    getSubjectColor, getScoreBadge, renderAvatar, escapeHtml, timeAgo
} from './lms-common.js';

let currentUser = null;
let userProfile = null;
let quizChartInstance = null;
let dashboardData = {};
let isDemo = false;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    isDemo = urlParams.get('demo') === 'true';

    if (isDemo) {
        const { default: DEMO_DATA } = await import('./demo-data.js');
        initDemoMode(DEMO_DATA);
        return;
    }

    const authResult = await requireAuth();
    if (!authResult) return;
    currentUser = authResult.user;
    userProfile = authResult.profile;


    // Use profile from auth, or fetch fresh, or fallback
    if (!userProfile) {
        try {
            const profile = await getOne(`users/${currentUser.uid}`);
            if (profile) {
                userProfile = profile;
            } else {
                userProfile = { name: currentUser.displayName || 'Student', email: currentUser.email, role: 'student', enrolledSubjects: [] };
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            userProfile = { name: currentUser.displayName || 'Student', email: currentUser.email, role: 'student', enrolledSubjects: [] };
        }
    }

    initUI();
    loadDashboardData();

    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await logout(); } catch(err) { window.location.href = 'login.html'; }
    });

    document.getElementById('assignmentFilter').addEventListener('change', renderAssignments);
    document.getElementById('lectureCourseFilter').addEventListener('change', renderLectures);
    document.getElementById('submitAssignmentForm').addEventListener('submit', handleAssignmentSubmit);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    document.querySelectorAll('.lms-sidebar__link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            const title = e.currentTarget.textContent.trim();
            document.getElementById('pageTitle').textContent = title;
        });
    });
});

function initUI() {
    initSidebar();
    initTabs();

    const name = userProfile.name || 'Student';
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${name.split(' ')[0]}!`;
    document.getElementById('sidebarAvatar').innerHTML = renderAvatar(name, 40);
    
    document.getElementById('profileName').value = name;
    document.getElementById('profileEmail').value = userProfile.email || currentUser.email;
    document.getElementById('profileNameDisplay').textContent = name;
    document.getElementById('profileAvatarBig').innerHTML = renderAvatar(name, 100).replace('width: 40px; height: 40px;', 'width: 100px; height: 100px; font-size: 2.5rem;');
    document.getElementById('profileJoinDate').textContent = `Joined: ${userProfile.createdAt ? formatDate(new Date(userProfile.createdAt)) : 'Recently'}`;

    const subjectsList = document.getElementById('profileSubjectsList');
    if (userProfile.enrolledSubjects && userProfile.enrolledSubjects.length > 0) {
        subjectsList.innerHTML = userProfile.enrolledSubjects.map(sub => `
            <li style="margin-bottom: 0.5rem;"><i class="fas ${getSubjectIcon(sub)} me-2 text-${getSubjectColor(sub)}"></i> ${sub}</li>
        `).join('');
    } else {
        subjectsList.innerHTML = '<li class="text-light">No enrolled subjects yet.</li>';
    }
}

function initDemoMode(data) {
    userProfile = data.user;
    currentUser = { uid: 'demo-user', email: data.user.email };
    dashboardData = data;
    
    initUI();
    
    document.getElementById('sidebarRole').textContent = 'Demo Student';
    const demoBanner = document.getElementById('demoBanner');
    if (demoBanner) demoBanner.style.display = 'flex';
    
    window.openSubmitModal = () => window.location.href = 'register.html';
    window.playLecture = () => window.location.href = 'register.html';
    
    renderOverview();
    renderCourses();
    renderAssignments();
    renderQuizzes();
    renderLectures();
    renderProgress();
    renderLiveClasses();
    
    setTimeout(() => {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Start Quiz') || btn.textContent.includes('Submit') || btn.textContent.includes('Join Now')) {
                btn.onclick = (e) => { e.preventDefault(); window.location.href = 'register.html'; };
            }
        });
    }, 100);
}

async function loadDashboardData() {
    try {
        const [courses, assignments, quizzes, lectures, liveClasses] = await Promise.all([
            getAll('courses'),
            getAll('assignments'),
            getAll('quizzes'),
            getAll('lectures'),
            getAll('liveClasses')
        ]);

        if (courses.length === 0) {
            dashboardData = { courses: [], assignments: [], quizzes: [], lectures: [], liveClasses: [] };
        } else {
            const coursesWithProgress = await Promise.all(courses.map(async c => {
                const prog = await getOne(`progress/${currentUser.uid}/${c.id}`);
                let progressValue = 0;
                if (prog && prog.totalLectures > 0) {
                    progressValue = Math.round((prog.lecturesWatched / prog.totalLectures) * 100);
                }
                return { ...c, progress: progressValue };
            }));
            dashboardData.courses = coursesWithProgress;
            dashboardData.assignments = assignments.map(a => {
                const c = courses.find(c => c.id === a.courseId);
                return { ...a, courseName: c ? c.title : 'Unknown Course', status: a.status || 'pending', score: a.score || null };
            });
            dashboardData.quizzes = quizzes.map(q => {
                const c = courses.find(c => c.id === q.courseId);
                return { ...q, courseName: c ? c.title : 'Unknown Course', status: q.status || 'not_started', score: q.score || null };
            });
            dashboardData.lectures = lectures.map(l => {
                const c = courses.find(c => c.id === l.courseId);
                return { ...l, courseName: c ? c.title : 'Unknown Course', thumbnail: 'fa-play-circle' };
            });
            dashboardData.liveClasses = liveClasses.map(lc => ({
                ...lc, time: lc.dateTime || lc.time || Date.now()
            }));
        }

        await renderOverview();
        renderCourses();
        renderAssignments();
        renderQuizzes();
        renderLectures();
        await renderProgress();
        renderLiveClasses();
        
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Error loading dashboard data", "error");
        dashboardData = { courses: [], assignments: [], quizzes: [], lectures: [], liveClasses: [] };
        await renderOverview();
        renderCourses();
        renderAssignments();
        renderQuizzes();
        renderLectures();
        await renderProgress();
        renderLiveClasses();
    }
}

async function renderOverview() {
    document.getElementById('statCourses').textContent = dashboardData.courses.length;
    const pendingCount = dashboardData.assignments.filter(a => a.status === 'pending').length;
    document.getElementById('statAssignments').textContent = pendingCount;
    
    const completedQuizzes = dashboardData.quizzes.filter(q => q.score !== null);
    const avgScore = completedQuizzes.length ? Math.round(completedQuizzes.reduce((a,b) => a + b.score, 0) / completedQuizzes.length) : 0;
    document.getElementById('statQuizScore').textContent = `${avgScore}%`;
    document.getElementById('statClasses').textContent = dashboardData.liveClasses.length;

    const activityList = document.getElementById('recentActivityList');
    const recentActivities = isDemo ? (dashboardData.activityLog || []) : (await getWhere('activityLog', 'userId', currentUser.uid) || []);
    
    activityList.innerHTML = recentActivities.length > 0 
        ? recentActivities.map(a => `<div class="recent-activity-item">
            <div class="activity-icon"><i class="fas ${a.icon || 'fa-check'}"></i></div>
            <div class="activity-content">
                <h4>${escapeHtml(a.title || 'Activity')}</h4>
                <p>${escapeHtml(a.description || '')} • ${timeAgo(a.timestamp || Date.now())}</p>
            </div>
        </div>`).join('')
        : '<div class="lms-empty-small"><i class="fas fa-clock"></i><p>No recent activity yet. Start a course to see your activity here!</p></div>';

    const upcomingList = document.getElementById('upcomingList');
    const upcomingAssignments = dashboardData.assignments.filter(a => a.status === 'pending').slice(0, 3);
    
    if (upcomingAssignments.length > 0) {
        upcomingList.innerHTML = upcomingAssignments.map(a => `
            <div class="live-card">
                <div class="live-card-icon bg-warning-light text-warning">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="live-card-details">
                    <div class="live-card-title">${escapeHtml(a.title)}</div>
                    <div class="live-card-time">Due: ${formatDate(new Date(a.dueDate || Date.now()))}</div>
                </div>
            </div>
        `).join('');
    } else {
        upcomingList.innerHTML = '<div class="lms-empty-small"><i class="fas fa-calendar-check"></i><p>No upcoming assignments!</p></div>';
    }
}

function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    if (dashboardData.courses.length === 0) {
        showEmpty(grid, 'No courses enrolled yet', 'fa-book-open');
        return;
    }

    grid.innerHTML = dashboardData.courses.map(course => `
        <div class="lms-course-card">
            <div class="lms-course-card__banner bg-${getSubjectColor(course.subject)}">
                <i class="fas ${getSubjectIcon(course.subject)}"></i>
            </div>
            <div class="lms-course-card__content">
                <span class="lms-badge lms-badge--primary mb-2">${escapeHtml(course.subject || 'Subject')}</span>
                <h3 class="lms-course-card__title">${escapeHtml(course.title)}</h3>
                <p class="text-light mb-3" style="font-size:0.9rem">${escapeHtml(course.description || '')}</p>
                <div class="lms-progress-wrap">
                    <div class="lms-progress-header">
                        <span>Progress</span>
                        <span>${course.progress || 0}%</span>
                    </div>
                    <div class="lms-progress">
                        <div class="lms-progress__bar" style="width: ${course.progress || 0}%"></div>
                    </div>
                </div>
                <button class="lms-btn lms-btn--outline lms-btn--block mt-3" onclick="window.location.href='course.html?id=${course.id}'">
                    Continue Course
                </button>
            </div>
        </div>
    `).join('');
}

function renderAssignments() {
    const filter = document.getElementById('assignmentFilter').value;
    const tbody = document.getElementById('assignmentsTableBody');
    
    let filtered = dashboardData.assignments;
    if (filter !== 'all') {
        filtered = filtered.filter(a => a.status === filter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-light">No assignments found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(a => {
        let statusBadge = '';
        if (a.status === 'pending') statusBadge = '<span class="lms-badge lms-badge--warning">Pending</span>';
        else if (a.status === 'submitted') statusBadge = '<span class="lms-badge lms-badge--primary">Submitted</span>';
        else if (a.status === 'graded') statusBadge = '<span class="lms-badge lms-badge--success">Graded</span>';

        let actionBtn = '';
        if (a.status === 'pending') {
            actionBtn = `<button class="lms-btn lms-btn--sm lms-btn--primary" onclick="window.openSubmitModal('${a.id}')">Submit</button>`;
        } else {
            actionBtn = `<button class="lms-btn lms-btn--sm lms-btn--outline">View</button>`;
        }

        return `
            <tr>
                <td><strong>${escapeHtml(a.title)}</strong></td>
                <td>${escapeHtml(a.courseName)}</td>
                <td>${formatDate(new Date(a.dueDate || Date.now()))}</td>
                <td>${statusBadge}</td>
                <td>${a.score !== null && a.score !== undefined ? `${a.score}/100` : '-'}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

window.openSubmitModal = (id) => {
    document.getElementById('submitAssignmentId').value = id;
    document.getElementById('submitModal').classList.add('active');
};

async function handleAssignmentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('submitAssignmentId').value;
    const text = document.getElementById('submitText').value;
    const fileInput = document.getElementById('submitFile');
    const file = fileInput.files[0];

    if (!text && !file) {
        showToast("Please provide text or a file", "error");
        return;
    }

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;

        let fileUrl = null;
        if (file) {
            const fileRef = storageRef(storage, `submissions/${currentUser.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            fileUrl = await getDownloadURL(fileRef);
        }

        await pushItem('submissions', {
            assignmentId: id,
            studentId: currentUser.uid,
            text: text,
            fileUrl: fileUrl,
            submittedAt: Date.now(),
            grade: null,
            feedback: null
        });

        showToast("Assignment submitted successfully!", "success");
        document.getElementById('submitModal').classList.remove('active');
        e.target.reset();
        
        const assignment = dashboardData.assignments.find(a => a.id === id);
        if(assignment) assignment.status = 'submitted';
        renderAssignments();
        renderOverview();
        
        btn.innerHTML = oldText;
        btn.disabled = false;
    } catch (error) {
        console.error("Submit error:", error);
        showToast("Error submitting assignment", "error");
        e.target.querySelector('button[type="submit"]').disabled = false;
        e.target.querySelector('button[type="submit"]').innerHTML = 'Submit Assignment';
    }
}

function renderQuizzes() {
    const tbody = document.getElementById('quizzesTableBody');
    
    if (dashboardData.quizzes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-light">No quizzes available</td></tr>`;
        return;
    }

    tbody.innerHTML = dashboardData.quizzes.map(q => {
        let statusBadge = '';
        if (q.status === 'not_started') statusBadge = '<span class="lms-badge lms-badge--warning">Not Started</span>';
        else if (q.status === 'completed') statusBadge = '<span class="lms-badge lms-badge--success">Completed</span>';

        let actionBtn = '';
        if (q.status === 'not_started') {
            actionBtn = `<button class="lms-btn lms-btn--sm lms-btn--primary" onclick="window.location.href='quiz.html?id=${q.id}'">Start Quiz</button>`;
        } else {
            actionBtn = `<button class="lms-btn lms-btn--sm lms-btn--outline">Review</button>`;
        }

        return `
            <tr>
                <td><strong>${escapeHtml(q.title)}</strong></td>
                <td>${escapeHtml(q.courseName)}</td>
                <td>${q.duration || 15} mins</td>
                <td>${q.questions ? q.questions.length || q.questions : 10}</td>
                <td>${statusBadge}</td>
                <td>${q.score !== null && q.score !== undefined ? getScoreBadge(q.score) : '-'}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

function renderLectures() {
    const grid = document.getElementById('lecturesGrid');
    if (dashboardData.lectures.length === 0) {
        showEmpty(grid, 'No lectures available', 'fa-video');
        return;
    }
    
    grid.innerHTML = dashboardData.lectures.map(l => `
        <div class="lecture-card">
            <div class="lecture-thumbnail" onclick="window.playLecture('${l.id}')">
                <i class="fas ${l.thumbnail || 'fa-play-circle'}"></i>
                <div class="play-btn" style="position: absolute; background: rgba(0,0,0,0.5); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-play" style="font-size: 1.5rem; margin-left: 5px;"></i>
                </div>
            </div>
            <div class="lecture-info">
                <h4 class="lecture-title">${escapeHtml(l.title)}</h4>
                <div class="lecture-meta">
                    <span>${escapeHtml(l.courseName || 'Course')}</span>
                    <span><i class="far fa-clock"></i> ${l.duration || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

window.playLecture = (id) => {
    const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; 
    document.getElementById('videoIframe').src = videoUrl;
    document.getElementById('videoModal').classList.add('active');
};

async function renderProgress() {
    const chartContainer = document.getElementById('quizChart').parentElement;
    
    if (quizChartInstance) {
        quizChartInstance.destroy();
        quizChartInstance = null;
    }

    const quizAttempts = isDemo ? (dashboardData.quizAttempts || []) : (await getWhere('quizAttempts', 'studentId', currentUser.uid) || []);
    quizAttempts.sort((a, b) => a.completedAt - b.completedAt);
    const lastAttempts = quizAttempts.slice(-10);

    if (lastAttempts.length === 0) {
        chartContainer.innerHTML = '<div class="lms-empty-small" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"><i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-light);"></i><p>No quiz attempts yet to show progress.</p></div>';
    } else {
        if (!document.getElementById('quizChart')) {
            chartContainer.innerHTML = '<canvas id="quizChart"></canvas>';
        }
        const ctx = document.getElementById('quizChart').getContext('2d');
        quizChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lastAttempts.map(a => a.quizTitle || 'Quiz'),
                datasets: [{
                    label: 'Score %',
                    data: lastAttempts.map(a => a.score || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    const progressContainer = document.getElementById('courseProgressContainer');
    if (dashboardData.courses.length === 0) {
        showEmpty(progressContainer, 'No course progress available', 'fa-chart-line');
        return;
    }
    
    progressContainer.innerHTML = dashboardData.courses.map(course => `
        <div class="mb-4">
            <div class="lms-progress-header">
                <strong>${escapeHtml(course.title)}</strong>
                <span>${course.progress || 0}%</span>
            </div>
            <div class="lms-progress">
                <div class="lms-progress__bar bg-${getSubjectColor(course.subject)}" style="width: ${course.progress || 0}%"></div>
            </div>
        </div>
    `).join('');
}

function renderLiveClasses() {
    const todayList = document.getElementById('liveTodayList');
    const upcomingList = document.getElementById('liveUpcomingList');

    if (dashboardData.liveClasses.length > 0) {
        const first = dashboardData.liveClasses[0];
        todayList.innerHTML = `
            <div class="live-card">
                <div class="live-card-icon bg-${getSubjectColor(first.subject || 'Basic Islamic Studies')} text-white">
                    <i class="fas ${getSubjectIcon(first.subject || 'Basic Islamic Studies')}"></i>
                </div>
                <div class="live-card-details">
                    <div class="live-card-title">${escapeHtml(first.title)}</div>
                    <div class="live-card-time"><i class="far fa-clock"></i> Starts soon</div>
                </div>
                <button class="lms-btn lms-btn--primary lms-btn--sm" onclick="window.open('${first.meetingUrl || '#'}', '_blank')">Join Now</button>
            </div>
        `;
    } else {
        todayList.innerHTML = '<p class="text-light">No classes scheduled for today.</p>';
    }

    if (dashboardData.liveClasses.length > 1) {
        upcomingList.innerHTML = dashboardData.liveClasses.slice(1).map(lc => `
            <div class="live-card">
                <div class="live-card-icon bg-${getSubjectColor(lc.subject || 'Basic Islamic Studies')}-light text-${getSubjectColor(lc.subject || 'Basic Islamic Studies')}">
                    <i class="fas ${getSubjectIcon(lc.subject || 'Basic Islamic Studies')}"></i>
                </div>
                <div class="live-card-details">
                    <div class="live-card-title">${escapeHtml(lc.title)}</div>
                    <div class="live-card-time"><i class="far fa-calendar"></i> ${formatDateTime(new Date(lc.time || Date.now()))}</div>
                </div>
            </div>
        `).join('');
    } else {
        upcomingList.innerHTML = '<p class="text-light">No upcoming classes scheduled.</p>';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('profileName').value.trim();
    const newPass = document.getElementById('profilePassword').value;

    if (!newName) {
        showToast("Name is required", "error");
        return;
    }

    try {
        const btn = e.target.querySelector('button');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;

        await updateItem(`users/${currentUser.uid}`, { name: newName });

        if (newPass) {
            await updatePassword(currentUser, newPass);
            document.getElementById('profilePassword').value = '';
        }

        userProfile.name = newName;
        initUI(); 
        
        showToast("Profile updated successfully", "success");
        btn.innerHTML = oldText;
        btn.disabled = false;

    } catch (error) {
        console.error("Update error:", error);
        showToast(error.message, "error");
        e.target.querySelector('button').disabled = false;
        e.target.querySelector('button').innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
}
