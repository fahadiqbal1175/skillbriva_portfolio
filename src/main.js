import "./styles.css";

const STORAGE_KEY = "fahad-portfolio-lms-state-v2";
const ADMIN_SESSION_KEY = "fahad-portfolio-lms-admin-session-v1";
const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME || "fahad").trim();
const ADMIN_PASSWORD_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  "552fdb8a598848510944313724bf50ed8c61a63365b46129538b412a25c0be51";
const ADMIN_ACTION_SELECTOR = [
  "[data-add-course]",
  "[data-delete-course]",
  "[data-add-module]",
  "[data-add-lesson]",
  "[data-delete-lesson]",
  "[data-add-question]",
  "[data-delete-question]",
  "[data-add-assignment]",
  "[data-add-student]",
  "[data-delete-student]",
  "[data-set-current-student]",
  "[data-reset-demo]",
  "[data-download-state]"
].join(",");
const ADMIN_FORM_IDS = new Set([
  "settingsForm",
  "courseForm",
  "lessonForm",
  "quizAdminForm",
  "assignmentAdminForm",
  "studentForm"
]);

const defaultState = {
  settings: {
    name: "Hafiz Fahad Iqbal",
    role: "Multi-Subject Online Tutor",
    headline: "Personalized teaching with a full learning dashboard",
    intro:
      "A clean portfolio and LMS for one-to-one tutoring, structured courses, assignments, quizzes, lesson resources, and student progress across multiple subjects.",
    about:
      "Hafiz Fahad Iqbal supports learners with calm, structured lessons in English, Mathematics, Science, computer skills, exam preparation, and study planning. Every course is organized into modules with clear outcomes, practice tasks, feedback, and measurable progress.",
    email: "hafiz.fahad@example.com",
    phone: "+92 300 0000000",
    location: "Online worldwide",
    availability: "Weekdays and weekend batches",
    cta: "Book a trial lesson",
    heroImage: "/assets/tutor-lms-hero.jpg"
  },
  subjects: [
    {
      name: "English Language",
      code: "EN",
      description: "Reading, grammar, vocabulary, writing, speaking practice, and confidence."
    },
    {
      name: "Mathematics",
      code: "MT",
      description: "Number fluency, problem solving, algebra basics, geometry, and exam practice."
    },
    {
      name: "Science",
      code: "SC",
      description: "Concept clarity, experiments, diagrams, reasoning, and test preparation."
    },
    {
      name: "Computer Skills",
      code: "CS",
      description: "Digital literacy, productivity tools, typing, coding logic, and projects."
    },
    {
      name: "Exam Preparation",
      code: "EX",
      description: "Syllabus planning, timed practice, revision systems, and performance feedback."
    },
    {
      name: "Study Skills",
      code: "SS",
      description: "Homework routines, note-taking, goal setting, progress tracking, and reflection."
    }
  ],
  stats: [
    { value: "7+", label: "Teaching tracks" },
    { value: "1:1", label: "Personal lessons" },
    { value: "24/7", label: "Resource access" },
    { value: "100%", label: "Editable content" }
  ],
  testimonials: [
    {
      name: "Parent of Grade 6 Student",
      quote:
        "The lessons are organized and practical. My child understands weekly targets, revision work, and progress clearly."
    },
    {
      name: "English Speaking Student",
      quote:
        "The speaking practice, vocabulary support, and writing feedback helped me become more confident in class."
    },
    {
      name: "Math Support Student",
      quote:
        "The dashboard helped me track assignments, quiz results, weak topics, and the next lesson without confusion."
    }
  ],
  courses: [
    {
      id: "english-communication-writing",
      title: "English Communication & Writing",
      subject: "English Language",
      level: "Beginner to Intermediate",
      duration: "8 weeks",
      description:
        "Build stronger reading, grammar, vocabulary, speaking confidence, and paragraph writing skills.",
      outcomes: [
        "Read short passages with better comprehension",
        "Write clear paragraphs with correct structure",
        "Speak with improved vocabulary and confidence"
      ],
      tags: ["Reading", "Writing", "Speaking"],
      modules: [
        {
          title: "Reading and Vocabulary",
          lessons: [
            {
              title: "Main Idea and Supporting Details",
              type: "Video",
              minutes: 20,
              videoUrl: "",
              content:
                "Students learn how to identify the main idea, supporting details, and unfamiliar vocabulary in short reading passages.\n\nThe lesson includes a guided passage, vocabulary notes, and a quick comprehension check.",
              resources: [
                {
                  label: "Reading comprehension checklist",
                  url: "/resources/reading-comprehension-checklist.txt"
                }
              ]
            },
            {
              title: "Vocabulary Builder",
              type: "Lesson",
              minutes: 18,
              videoUrl: "",
              content:
                "Students practice useful academic vocabulary, synonyms, sentence examples, and word-family patterns.",
              resources: [
                {
                  label: "Vocabulary practice sheet",
                  url: "/resources/vocabulary-practice-sheet.txt"
                }
              ]
            }
          ]
        },
        {
          title: "Writing and Speaking",
          lessons: [
            {
              title: "Paragraph Structure",
              type: "Video",
              minutes: 24,
              videoUrl: "",
              content:
                "Students learn topic sentences, supporting details, transitions, and a short conclusion for clear paragraph writing.",
              resources: [
                {
                  label: "Paragraph writing template",
                  url: "/resources/paragraph-writing-template.txt"
                }
              ]
            }
          ]
        }
      ],
      assignments: [
        {
          id: "english-paragraph-speaking-task",
          title: "Paragraph and speaking reflection",
          due: "Every Friday",
          prompt:
            "Write one paragraph on the assigned topic and submit a short speaking reflection explaining your main idea.",
          maxPoints: 20
        }
      ],
      quiz: {
        title: "English Communication Quiz",
        questions: [
          {
            question: "What is the purpose of a topic sentence?",
            options: ["To introduce the main idea", "To list random words", "To end the paragraph", "To avoid details"],
            answer: 0
          },
          {
            question: "A strong reading routine should include:",
            options: [
              "Skipping difficult words",
              "Finding main ideas and key details",
              "Reading without checking meaning",
              "Only memorizing answers"
            ],
            answer: 1
          }
        ]
      }
    },
    {
      id: "mathematics-problem-solving",
      title: "Mathematics Problem Solving",
      subject: "Mathematics",
      level: "Grade 5-8",
      duration: "10 weeks",
      description:
        "Strengthen number sense, word-problem strategy, algebra basics, and step-by-step exam solutions.",
      outcomes: [
        "Solve multi-step word problems with a clear method",
        "Improve accuracy in fractions, decimals, and percentages",
        "Show complete working for quiz and exam questions"
      ],
      tags: ["Problem solving", "Practice sets", "Exam skills"],
      modules: [
        {
          title: "Foundation Fluency",
          lessons: [
            {
              title: "Fractions, Decimals, and Percentages",
              type: "Lesson",
              minutes: 25,
              videoUrl: "",
              content:
                "Students connect fractions, decimals, and percentages through examples, visual models, and short practice problems.",
              resources: [
                {
                  label: "Math practice planner",
                  url: "/resources/math-practice-planner.txt"
                }
              ]
            }
          ]
        },
        {
          title: "Word Problems and Algebra",
          lessons: [
            {
              title: "Setting Up a Word Problem",
              type: "Worksheet",
              minutes: 22,
              videoUrl: "",
              content:
                "Students learn how to underline important information, choose the operation, write an equation, and check the answer.",
              resources: [
                {
                  label: "Word problem strategy sheet",
                  url: "/resources/word-problem-strategy-sheet.txt"
                }
              ]
            }
          ]
        }
      ],
      assignments: [
        {
          id: "math-practice-set",
          title: "Weekly math practice set",
          due: "Wednesday",
          prompt:
            "Submit completed practice questions and mark any problems that need review in the next session.",
          maxPoints: 25
        }
      ],
      quiz: {
        title: "Math Problem Solving Quiz",
        questions: [
          {
            question: "What is the first step in solving a word problem?",
            options: [
              "Guess the answer",
              "Identify important information",
              "Skip the question",
              "Copy the final answer"
            ],
            answer: 1
          }
        ]
      }
    },
    {
      id: "science-computer-skills",
      title: "Science & Computer Skills",
      subject: "Science and Technology",
      level: "Grade 6-10",
      duration: "10 weeks",
      description:
        "Learn scientific thinking, diagrams, basic research skills, digital tools, and introductory coding logic.",
      outcomes: [
        "Explain science concepts using evidence and examples",
        "Create simple digital study materials",
        "Understand basic coding logic and problem decomposition"
      ],
      tags: ["Science", "Digital skills", "Projects"],
      modules: [
        {
          title: "Science Thinking",
          lessons: [
            {
              title: "Experiments and Evidence",
              type: "Lesson",
              minutes: 24,
              videoUrl: "",
              content:
                "Students learn how to ask a scientific question, form a hypothesis, observe results, and explain evidence.",
              resources: [
                {
                  label: "Science observation template",
                  url: "/resources/science-observation-template.txt"
                }
              ]
            }
          ]
        },
        {
          title: "Digital Skills",
          lessons: [
            {
              title: "Intro to Coding Logic",
              type: "Video",
              minutes: 21,
              videoUrl: "",
              content:
                "Students practice breaking a task into small steps, using conditions, and writing simple algorithm-style instructions.",
              resources: [
                {
                  label: "Coding logic worksheet",
                  url: "/resources/coding-logic-worksheet.txt"
                }
              ]
            }
          ]
        }
      ],
      assignments: [
        {
          id: "science-digital-project",
          title: "Mini research or digital project",
          due: "Friday",
          prompt:
            "Create a short explanation, diagram, or digital slide about the assigned science or technology topic.",
          maxPoints: 30
        }
      ],
      quiz: {
        title: "Science and Technology Quiz",
        questions: [
          {
            question: "What should a good science explanation include?",
            options: [
              "Only a final answer",
              "Evidence and clear reasoning",
              "No examples",
              "Unrelated details"
            ],
            answer: 1
          }
        ]
      }
    }
  ],
  students: [
    {
      id: "student-a",
      name: "Maya Roberts",
      email: "maya@example.com",
      status: "Active",
      notes: "English and Math support, weekend batch",
      enrolledCourseIds: ["english-communication-writing", "mathematics-problem-solving"]
    },
    {
      id: "student-b",
      name: "Omar Shah",
      email: "omar@example.com",
      status: "Active",
      notes: "Science and computer skills project track",
      enrolledCourseIds: ["science-computer-skills"]
    }
  ],
  currentStudentId: "student-a",
  progress: {
    "student-a": {
      "english-communication-writing": ["0-0"],
      "mathematics-problem-solving": []
    },
    "student-b": {
      "science-computer-skills": ["0-0"]
    }
  },
  quizResults: {
    "student-a": {
      "english-communication-writing": { score: 50, total: 100 }
    }
  },
  submissions: {
    "student-a": {}
  }
};

let state = loadState();
let toastTimer;
let adminLoginError = "";

const app = document.querySelector("#app");

window.addEventListener("hashchange", render);
document.addEventListener("click", handleGlobalClicks);
document.addEventListener("submit", handleGlobalSubmit);

render();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(defaultState);
    return normalizeState(JSON.parse(saved));
  } catch {
    return clone(defaultState);
  }
}

function normalizeState(next) {
  const merged = { ...clone(defaultState), ...next };
  merged.settings = { ...defaultState.settings, ...(next.settings || {}) };
  merged.subjects = Array.isArray(next.subjects) ? next.subjects : clone(defaultState.subjects);
  merged.stats = Array.isArray(next.stats) ? next.stats : clone(defaultState.stats);
  merged.testimonials = Array.isArray(next.testimonials)
    ? next.testimonials
    : clone(defaultState.testimonials);
  merged.courses = Array.isArray(next.courses) ? next.courses : clone(defaultState.courses);
  merged.students = Array.isArray(next.students) ? next.students : clone(defaultState.students);
  merged.progress = next.progress || clone(defaultState.progress);
  merged.quizResults = next.quizResults || clone(defaultState.quizResults);
  merged.submissions = next.submissions || clone(defaultState.submissions);
  if (!merged.currentStudentId || !merged.students.some((student) => student.id === merged.currentStudentId)) {
    merged.currentStudentId = merged.students[0]?.id || "";
  }
  return merged;
}

function saveState(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function routeParts() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return (hash || "home").split("/").filter(Boolean);
}

function render() {
  const parts = routeParts();
  const page = parts[0] || "home";
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="site-shell">
      ${renderHeader(page)}
      <main class="main" id="main">${renderPage(parts)}</main>
      ${renderFooter()}
    </div>
  `;
  bindPage(parts);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderHeader(active) {
  const nav = [
    ["home", "Home"],
    ["courses", "Courses"],
    ["dashboard", "Student"]
  ];
  if (isAdminAuthenticated()) nav.push(["admin", "Admin"]);
  nav.push(["contact", "Contact"]);

  return `
    <header class="site-header">
      <div class="nav-wrap">
        <a href="#home" class="brand" aria-label="Home">
          <span class="brand-mark">${initials(state.settings.name)}</span>
          <span class="brand-text">
            <span class="brand-name">${escapeHtml(state.settings.name)}</span>
            <span class="brand-role">${escapeHtml(state.settings.role)}</span>
          </span>
        </a>
        <nav class="main-nav" aria-label="Primary navigation">
          ${nav
            .map(
              ([id, label]) =>
                `<a class="nav-link ${active === id ? "active" : ""}" href="#${id}">${label}</a>`
            )
            .join("")}
        </nav>
      </div>
    </header>
  `;
}

function renderPage(parts) {
  const [page, a, b, c] = parts;
  if (page === "courses") return renderCoursesPage();
  if (page === "course") return renderCourseDetail(a);
  if (page === "lesson") return renderLessonViewer(a, Number(b), Number(c));
  if (page === "dashboard") return renderDashboard();
  if (page === "admin-login") return renderAdminLogin("#admin/settings");
  if (page === "admin") {
    if (!isAdminAuthenticated()) return renderAdminLogin(`#${parts.join("/") || "admin/settings"}`);
    return renderAdmin(a || "settings");
  }
  if (page === "quiz") return renderQuiz(a);
  if (page === "assignment") return renderAssignment(a, b);
  if (page === "contact") return renderContactPage();
  return renderHome();
}

function renderHome() {
  const featuredCourses = state.courses.slice(0, 3);
  return `
    <section class="hero">
      <div>
        <span class="eyebrow">${escapeHtml(state.settings.availability)}</span>
        <h1>${escapeHtml(state.settings.name)}</h1>
        <p class="lead">${escapeHtml(state.settings.headline)}. ${escapeHtml(state.settings.intro)}</p>
        <div class="hero-actions">
          <a class="btn primary" href="#courses">Explore courses</a>
          <a class="btn secondary" href="#contact">${escapeHtml(state.settings.cta)}</a>
        </div>
      </div>
      <div class="hero-media" aria-label="Teaching workspace">
        <img class="hero-photo" src="${escapeAttr(state.settings.heroImage)}" alt="Modern online tutoring workspace" />
        <div class="metric-strip">
          ${state.stats
            .slice(0, 3)
            .map(
              (stat) => `
                <div class="metric">
                  <strong>${escapeHtml(stat.value)}</strong>
                  <span>${escapeHtml(stat.label)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">About</span>
            <h2>Structured lessons, calm guidance, clear progress</h2>
          </div>
          <p>${escapeHtml(state.settings.about)}</p>
        </div>
        <div class="stats-band">
          ${state.stats
            .map(
              (stat) => `
                <div class="stat-tile">
                  <strong>${escapeHtml(stat.value)}</strong>
                  <span>${escapeHtml(stat.label)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Subjects</span>
            <h2>Teaching areas</h2>
          </div>
          <a class="btn ghost" href="#courses">View catalog</a>
        </div>
        <div class="grid three">
          ${state.subjects.map(renderSubjectCard).join("")}
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Courses</span>
            <h2>Featured learning tracks</h2>
          </div>
        </div>
        <div class="grid three">
          ${featuredCourses.map(renderCourseCard).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Testimonials</span>
            <h2>Student and parent feedback</h2>
          </div>
        </div>
        <div class="grid three">
          ${state.testimonials
            .map(
              (item) => `
                <article class="card testimonial-card">
                  <p class="copy">"${escapeHtml(item.quote)}"</p>
                  <strong>${escapeHtml(item.name)}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="cta-band">
          <div>
            <h2>Ready for a focused learning plan?</h2>
            <p>${escapeHtml(state.settings.location)}. ${escapeHtml(state.settings.availability)}.</p>
          </div>
          <a class="btn" href="#contact">${escapeHtml(state.settings.cta)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderSubjectCard(subject) {
  return `
    <article class="card subject-card">
      <div class="subject-top">
        <div>
          <h3>${escapeHtml(subject.name)}</h3>
          <p class="copy">${escapeHtml(subject.description)}</p>
        </div>
        <span class="subject-icon">${escapeHtml(subject.code)}</span>
      </div>
    </article>
  `;
}

function renderCoursesPage() {
  const subjects = unique(state.courses.map((course) => course.subject));
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Course catalog</span>
        <h1>Courses with modules, lessons, quizzes, assignments, and resources</h1>
        <p class="lead">Search the active catalog and open any course to view its learning path.</p>
      </div>
    </section>
    <section class="container">
      <div class="toolbar">
        <label class="field">
          <span>Search</span>
          <input id="courseSearch" type="search" placeholder="Search courses" />
        </label>
        <label class="field">
          <span>Subject</span>
          <select id="subjectFilter">
            <option value="">All subjects</option>
            ${subjects.map((subject) => `<option value="${escapeAttr(subject)}">${escapeHtml(subject)}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Level</span>
          <select id="levelFilter">
            <option value="">All levels</option>
            ${unique(state.courses.map((course) => course.level))
              .map((level) => `<option value="${escapeAttr(level)}">${escapeHtml(level)}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <div id="courseResults" class="grid three">
        ${state.courses.map(renderCourseCard).join("")}
      </div>
    </section>
  `;
}

function renderCourseCard(course) {
  const lessons = totalLessons(course);
  return `
    <article class="card course-card" data-course-card data-title="${escapeAttr(
      `${course.title} ${course.subject} ${course.level} ${course.description}`
    )}" data-subject="${escapeAttr(course.subject)}" data-level="${escapeAttr(course.level)}">
      <div class="course-top">
        <div>
          <div class="badge-row">
            <span class="badge">${escapeHtml(course.subject)}</span>
            <span class="badge blue">${escapeHtml(course.level)}</span>
          </div>
          <h3>${escapeHtml(course.title)}</h3>
        </div>
      </div>
      <p class="copy">${escapeHtml(course.description)}</p>
      <div class="course-meta">
        <span>${escapeHtml(course.duration)}</span>
        <span>${course.modules.length} modules</span>
        <span>${lessons} lessons</span>
      </div>
      <div class="badge-row">
        ${(course.tags || []).map((tag) => `<span class="badge amber">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="course-actions">
        <a class="btn primary small" href="#course/${course.id}">View course</a>
        <a class="btn secondary small" href="#lesson/${course.id}/0/0">Open lesson</a>
      </div>
    </article>
  `;
}

function renderCourseDetail(courseId) {
  const course = findCourse(courseId);
  if (!course) return renderNotFound("Course not found", "#courses");
  const student = currentStudent();
  const percent = progressPercent(student.id, course.id);
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">${escapeHtml(course.subject)}</span>
        <h1>${escapeHtml(course.title)}</h1>
        <p class="lead">${escapeHtml(course.description)}</p>
        <div class="badge-row">
          <span class="badge">${escapeHtml(course.level)}</span>
          <span class="badge blue">${escapeHtml(course.duration)}</span>
          <span class="badge green">${totalLessons(course)} lessons</span>
        </div>
      </div>
    </section>
    <section class="container detail-layout">
      <div>
        ${course.modules.map((module, moduleIndex) => renderModule(course, module, moduleIndex)).join("")}
      </div>
      <aside class="side-panel">
        <h3>Course progress</h3>
        <p class="muted">${escapeHtml(student.name)}</p>
        <div class="progress" aria-label="Progress ${percent}%"><span style="--value:${percent}%"></span></div>
        <p class="copy">${percent}% complete</p>
        <button class="btn primary" data-enroll="${course.id}">Enroll student</button>
        <hr />
        <h3>Outcomes</h3>
        <ul class="compact-list">
          ${(course.outcomes || []).map((outcome) => `<li class="compact-item">${escapeHtml(outcome)}</li>`).join("")}
        </ul>
        <div class="button-row" style="margin-top: 1rem;">
          <a class="btn secondary small" href="#quiz/${course.id}">Take quiz</a>
          ${course.assignments
            .map(
              (assignment) =>
                `<a class="btn ghost small" href="#assignment/${course.id}/${assignment.id}">${escapeHtml(assignment.title)}</a>`
            )
            .join("")}
        </div>
      </aside>
    </section>
  `;
}

function renderModule(course, module, moduleIndex) {
  return `
    <section class="module-block">
      <div class="module-head">
        <h3>${escapeHtml(module.title)}</h3>
        <span class="badge">${module.lessons.length} lessons</span>
      </div>
      <div class="lesson-list">
        ${module.lessons
          .map(
            (lesson, lessonIndex) => `
              <div class="lesson-row">
                <div>
                  <span class="lesson-title">${escapeHtml(lesson.title)}</span>
                  <span class="muted">${escapeHtml(lesson.type)} - ${lesson.minutes} min</span>
                </div>
                <a class="btn secondary small" href="#lesson/${course.id}/${moduleIndex}/${lessonIndex}">Open</a>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderLessonViewer(courseId, moduleIndex = 0, lessonIndex = 0) {
  const course = findCourse(courseId);
  const module = course?.modules?.[moduleIndex];
  const lesson = module?.lessons?.[lessonIndex];
  if (!course || !module || !lesson) return renderNotFound("Lesson not found", "#courses");
  const student = currentStudent();
  const completed = getCompleted(student.id, course.id).includes(`${moduleIndex}-${lessonIndex}`);
  const embed = videoEmbedUrl(lesson.videoUrl);
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">${escapeHtml(course.title)}</span>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p class="lead">${escapeHtml(module.title)} - ${escapeHtml(lesson.type)} - ${lesson.minutes} minutes</p>
      </div>
    </section>
    <section class="container lesson-layout">
      <div>
        <div class="video-panel">
          ${
            embed
              ? `<iframe class="video-frame" src="${escapeAttr(embed)}" title="${escapeAttr(
                  lesson.title
                )}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
              : `<div class="video-placeholder">
                  <div>
                    <div class="play-mark" aria-hidden="true"></div>
                    <strong>${escapeHtml(lesson.title)}</strong>
                  </div>
                </div>`
          }
        </div>
        <article class="lesson-content">
          ${paragraphs(lesson.content)}
          <div class="button-row">
            <button class="btn ${completed ? "success" : "primary"}" data-complete-lesson="${course.id}" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
              ${completed ? "Completed" : "Mark complete"}
            </button>
            <a class="btn secondary" href="#course/${course.id}">Back to course</a>
          </div>
        </article>
      </div>
      <aside class="side-panel">
        <h3>Resources</h3>
        <ul class="resource-list">
          ${(lesson.resources || [])
            .map(
              (resource) => `
                <li>
                  <a href="${escapeAttr(resource.url)}" download target="_blank" rel="noreferrer">
                    <span>${escapeHtml(resource.label)}</span>
                    <span>Download</span>
                  </a>
                </li>
              `
            )
            .join("") || `<li class="compact-item">No resources yet</li>`}
        </ul>
        <hr />
        <h3>Next lessons</h3>
        <ul class="compact-list">
          ${flattenLessons(course)
            .slice(0, 5)
            .map(
              (item) => `
                <li>
                  <a class="compact-item" href="#lesson/${course.id}/${item.moduleIndex}/${item.lessonIndex}">
                    ${escapeHtml(item.lesson.title)}
                  </a>
                </li>
              `
            )
            .join("")}
        </ul>
      </aside>
    </section>
  `;
}

function renderDashboard() {
  const student = currentStudent();
  const enrolled = state.courses.filter((course) => student.enrolledCourseIds.includes(course.id));
  const results = state.quizResults[student.id] || {};
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Student dashboard</span>
        <h1>${escapeHtml(student.name)}</h1>
        <p class="lead">My courses, lesson progress, grades, assignments, and submissions.</p>
      </div>
    </section>
    <section class="container dashboard-grid">
      <div class="dashboard-panel">
        <div class="section-head">
          <div>
            <h2>My courses</h2>
            <p>${enrolled.length} active enrollments</p>
          </div>
        </div>
        ${
          enrolled.length
            ? enrolled
                .map((course) => {
                  const percent = progressPercent(student.id, course.id);
                  return `
                    <article class="dash-course">
                      <div class="course-top">
                        <div>
                          <h3>${escapeHtml(course.title)}</h3>
                          <p class="muted">${escapeHtml(course.subject)} - ${escapeHtml(course.level)}</p>
                        </div>
                        <a class="btn secondary small" href="#course/${course.id}">Open</a>
                      </div>
                      <div class="progress"><span style="--value:${percent}%"></span></div>
                      <span class="muted">${percent}% complete</span>
                    </article>
                  `;
                })
                .join("")
            : `<div class="empty-state">No courses enrolled.</div>`
        }
      </div>
      <div class="grid">
        <div class="dashboard-panel">
          <h2>Grades</h2>
          <table class="grade-table">
            <thead><tr><th>Course</th><th>Score</th></tr></thead>
            <tbody>
              ${
                Object.keys(results).length
                  ? Object.entries(results)
                      .map(([courseId, result]) => {
                        const course = findCourse(courseId);
                        return `<tr><td>${escapeHtml(course?.title || courseId)}</td><td>${result.score}/${result.total}</td></tr>`;
                      })
                      .join("")
                  : `<tr><td colspan="2">No quiz scores yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
        <div class="dashboard-panel">
          <h2>Assignments</h2>
          <div class="grid">
            ${enrolled
              .flatMap((course) =>
                course.assignments.map(
                  (assignment) => `
                    <article class="assignment-card card">
                      <div class="assignment-top">
                        <div>
                          <h3>${escapeHtml(assignment.title)}</h3>
                          <p class="muted">${escapeHtml(course.title)} - Due ${escapeHtml(assignment.due)}</p>
                        </div>
                      </div>
                      <a class="btn secondary small" href="#assignment/${course.id}/${assignment.id}">Submit</a>
                    </article>
                  `
                )
              )
              .join("") || `<div class="empty-state">No assignments assigned.</div>`}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderQuiz(courseId) {
  const course = findCourse(courseId) || state.courses[0];
  if (!course) return renderNotFound("Quiz not found", "#courses");
  const quiz = course.quiz || { title: "Quiz", questions: [] };
  const result = state.quizResults[currentStudent().id]?.[course.id];
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Quiz</span>
        <h1>${escapeHtml(quiz.title)}</h1>
        <p class="lead">${escapeHtml(course.title)}</p>
      </div>
    </section>
    <section class="container">
      <form class="quiz-panel" id="quizForm" data-course="${course.id}">
        ${result ? `<div class="notice">Latest score: ${result.score}/${result.total}</div>` : ""}
        ${
          quiz.questions.length
            ? quiz.questions.map((question, index) => renderQuizQuestion(question, index)).join("")
            : `<div class="empty-state">No quiz questions yet.</div>`
        }
        <div class="form-actions">
          <button class="btn primary" type="submit">Submit quiz</button>
          <a class="btn secondary" href="#course/${course.id}">Back to course</a>
        </div>
      </form>
    </section>
  `;
}

function renderQuizQuestion(question, index) {
  return `
    <fieldset class="quiz-question">
      <legend><strong>${index + 1}. ${escapeHtml(question.question)}</strong></legend>
      <div class="option-list">
        ${question.options
          .map(
            (option, optionIndex) => `
              <label class="option">
                <input type="radio" name="q-${index}" value="${optionIndex}" required />
                <span>${escapeHtml(option)}</span>
              </label>
            `
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderAssignment(courseId, assignmentId) {
  const course = findCourse(courseId);
  const assignment = course?.assignments?.find((item) => item.id === assignmentId);
  if (!course || !assignment) return renderNotFound("Assignment not found", "#dashboard");
  const student = currentStudent();
  const saved = state.submissions[student.id]?.[assignment.id];
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Assignment</span>
        <h1>${escapeHtml(assignment.title)}</h1>
        <p class="lead">${escapeHtml(course.title)} - Due ${escapeHtml(assignment.due)} - ${assignment.maxPoints} points</p>
      </div>
    </section>
    <section class="container detail-layout">
      <article class="quiz-panel">
        <h2>Prompt</h2>
        <p class="copy">${escapeHtml(assignment.prompt)}</p>
        <form id="assignmentForm" data-course="${course.id}" data-assignment="${assignment.id}">
          <label class="field">
            <span>Response</span>
            <textarea name="response" required>${escapeHtml(saved?.response || "")}</textarea>
          </label>
          <label class="field">
            <span>File or recording link</span>
            <input name="link" type="url" value="${escapeAttr(saved?.link || "")}" placeholder="https://..." />
          </label>
          <div class="form-actions">
            <button class="btn primary" type="submit">Submit assignment</button>
            <a class="btn secondary" href="#dashboard">Dashboard</a>
          </div>
        </form>
      </article>
      <aside class="side-panel">
        <h3>Status</h3>
        <p class="copy">${saved ? `Submitted on ${escapeHtml(saved.date)}` : "Not submitted yet"}</p>
      </aside>
    </section>
  `;
}

function renderAdminLogin(returnTo = "#admin/settings") {
  const safeReturnTo = returnTo.startsWith("#admin") ? returnTo : "#admin/settings";
  return `
    <section class="auth-shell">
      <form id="adminLoginForm" class="auth-card" data-return-to="${escapeAttr(safeReturnTo)}">
        <div class="auth-lock" aria-hidden="true">FI</div>
        <span class="eyebrow">Owner access</span>
        <h1>Admin login</h1>
        <p class="lead">This area is private for Hafiz Fahad Iqbal.</p>
        ${adminLoginError ? `<p class="auth-error">${escapeHtml(adminLoginError)}</p>` : ""}
        <label class="field">
          <span>Username</span>
          <input name="username" autocomplete="username" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <div class="form-actions">
          <button class="btn primary" type="submit">Sign in</button>
          <a class="btn secondary" href="#home">Back to site</a>
        </div>
      </form>
    </section>
  `;
}

function renderAdmin(tab) {
  const tabs = [
    ["settings", "Settings"],
    ["courses", "Courses"],
    ["lessons", "Lessons"],
    ["assessments", "Assessments"],
    ["students", "Students"]
  ];
  return `
    <section class="page-head">
      <div class="container admin-titlebar">
        <div>
          <span class="eyebrow">Admin dashboard</span>
          <h1>Manage content</h1>
          <p class="lead">Edit portfolio content, courses, lessons, quizzes, assignments, and students.</p>
        </div>
        <button class="btn secondary" type="button" data-admin-logout>Sign out</button>
      </div>
    </section>
    <section class="container">
      <nav class="admin-tabs" aria-label="Admin sections">
        ${tabs
          .map(([id, label]) => `<a class="tab ${tab === id ? "active" : ""}" href="#admin/${id}">${label}</a>`)
          .join("")}
      </nav>
      ${renderAdminTab(tab)}
    </section>
  `;
}

function renderAdminTab(tab) {
  if (tab === "courses") return renderCourseAdmin();
  if (tab === "lessons") return renderLessonAdmin();
  if (tab === "assessments") return renderAssessmentAdmin();
  if (tab === "students") return renderStudentAdmin();
  return renderSettingsAdmin();
}

function renderSettingsAdmin() {
  const s = state.settings;
  return `
    <form id="settingsForm" class="tool-panel">
      <div class="form-grid">
        ${inputField("name", "Name", s.name)}
        ${inputField("role", "Role", s.role)}
        ${inputField("headline", "Headline", s.headline, "full")}
        ${textareaField("intro", "Hero intro", s.intro, "full")}
        ${textareaField("about", "About", s.about, "full")}
        ${inputField("email", "Email", s.email, "", "email")}
        ${inputField("phone", "Phone", s.phone)}
        ${inputField("location", "Location", s.location)}
        ${inputField("availability", "Availability", s.availability)}
        ${inputField("cta", "CTA label", s.cta)}
        ${inputField("heroImage", "Hero image path", s.heroImage, "full")}
      </div>
      <div class="form-actions">
        <button class="btn primary" type="submit">Save settings</button>
        <button class="btn secondary" type="button" data-download-state>Download backup</button>
        <button class="btn danger" type="button" data-reset-demo>Reset demo data</button>
      </div>
    </form>
  `;
}

function renderCourseAdmin() {
  const selected = findCourse(routeParts()[2]) || state.courses[0];
  if (!selected) return `<div class="empty-state">No courses yet.</div>`;
  return `
    <div class="admin-layout">
      <aside class="tool-panel">
        <div class="admin-list">
          ${state.courses
            .map(
              (course) =>
                `<a class="list-button ${course.id === selected.id ? "active" : ""}" href="#admin/courses/${course.id}">${escapeHtml(
                  course.title
                )}</a>`
            )
            .join("")}
        </div>
        <div class="form-actions">
          <button class="btn primary small" data-add-course type="button">Add course</button>
        </div>
      </aside>
      <form id="courseForm" class="tool-panel" data-course="${selected.id}">
        <div class="form-grid">
          ${inputField("title", "Title", selected.title)}
          ${inputField("subject", "Subject", selected.subject)}
          ${inputField("level", "Level", selected.level)}
          ${inputField("duration", "Duration", selected.duration)}
          ${textareaField("description", "Description", selected.description, "full")}
          ${textareaField("outcomes", "Outcomes, one per line", (selected.outcomes || []).join("\n"), "full")}
          ${inputField("tags", "Tags, comma separated", (selected.tags || []).join(", "), "full")}
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Save course</button>
          <button class="btn danger" type="button" data-delete-course="${selected.id}">Delete course</button>
        </div>
      </form>
    </div>
  `;
}

function renderLessonAdmin() {
  const course = findCourse(routeParts()[2]) || state.courses[0];
  const moduleIndex = Number(routeParts()[3] || 0);
  const lessonIndex = Number(routeParts()[4] || 0);
  const module = course?.modules?.[moduleIndex] || course?.modules?.[0];
  const lesson = module?.lessons?.[lessonIndex] || module?.lessons?.[0];
  if (!course || !module || !lesson) return `<div class="empty-state">Add a course, module, and lesson first.</div>`;
  const actualModuleIndex = course.modules.indexOf(module);
  const actualLessonIndex = module.lessons.indexOf(lesson);
  return `
    <div class="admin-layout">
      <aside class="tool-panel">
        <label class="field">
          <span>Course</span>
          <select id="lessonCourseSelect">
            ${state.courses.map((item) => `<option value="${item.id}" ${item.id === course.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </label>
        <div class="admin-list" style="margin-top: 1rem;">
          ${course.modules
            .map(
              (item, index) => `
                <a class="list-button ${index === actualModuleIndex ? "active" : ""}" href="#admin/lessons/${course.id}/${index}/0">
                  ${escapeHtml(item.title)}
                </a>
              `
            )
            .join("")}
        </div>
        <div class="form-actions">
          <button class="btn primary small" type="button" data-add-module="${course.id}">Add module</button>
        </div>
      </aside>
      <form id="lessonForm" class="tool-panel" data-course="${course.id}" data-module="${actualModuleIndex}" data-lesson="${actualLessonIndex}">
        <div class="form-grid">
          ${inputField("moduleTitle", "Module title", module.title, "full")}
          <label class="field full">
            <span>Lesson</span>
            <select id="lessonSelect">
              ${module.lessons
                .map(
                  (item, index) =>
                    `<option value="${index}" ${index === actualLessonIndex ? "selected" : ""}>${escapeHtml(item.title)}</option>`
                )
                .join("")}
            </select>
          </label>
          ${inputField("title", "Lesson title", lesson.title)}
          ${inputField("type", "Lesson type", lesson.type)}
          ${inputField("minutes", "Minutes", lesson.minutes, "", "number")}
          ${inputField("videoUrl", "Video URL", lesson.videoUrl)}
          ${textareaField("content", "Lesson content", lesson.content, "full")}
          ${inputField("resourceLabel", "Resource label", lesson.resources?.[0]?.label || "")}
          ${inputField("resourceUrl", "Resource URL", lesson.resources?.[0]?.url || "")}
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Save lesson</button>
          <button class="btn secondary" type="button" data-add-lesson="${course.id}" data-module="${actualModuleIndex}">Add lesson</button>
          <button class="btn danger" type="button" data-delete-lesson="${course.id}" data-module="${actualModuleIndex}" data-lesson="${actualLessonIndex}">Delete lesson</button>
        </div>
      </form>
    </div>
  `;
}

function renderAssessmentAdmin() {
  const course = findCourse(routeParts()[2]) || state.courses[0];
  if (!course) return `<div class="empty-state">No course selected.</div>`;
  const questionIndex = Number(routeParts()[3] || 0);
  const question = course.quiz?.questions?.[questionIndex] || course.quiz?.questions?.[0];
  const assignment = course.assignments?.[0];
  return `
    <div class="admin-layout">
      <aside class="tool-panel">
        <label class="field">
          <span>Course</span>
          <select id="assessmentCourseSelect">
            ${state.courses.map((item) => `<option value="${item.id}" ${item.id === course.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </label>
        <div class="admin-list" style="margin-top: 1rem;">
          ${(course.quiz?.questions || [])
            .map(
              (item, index) =>
                `<a class="list-button ${index === questionIndex ? "active" : ""}" href="#admin/assessments/${course.id}/${index}">
                  Question ${index + 1}
                </a>`
            )
            .join("")}
        </div>
        <div class="form-actions">
          <button class="btn primary small" type="button" data-add-question="${course.id}">Add question</button>
        </div>
      </aside>
      <div class="grid">
        <form id="quizAdminForm" class="tool-panel" data-course="${course.id}" data-question="${questionIndex}">
          <h2>Quiz</h2>
          <div class="form-grid">
            ${inputField("quizTitle", "Quiz title", course.quiz?.title || "Course Quiz", "full")}
            ${
              question
                ? `
                  ${textareaField("question", "Question", question.question, "full")}
                  ${textareaField("options", "Options, one per line", question.options.join("\n"), "full")}
                  ${inputField("answer", "Correct option number", String((question.answer || 0) + 1), "", "number")}
                `
                : `<div class="empty-state full">No question selected.</div>`
            }
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit">Save quiz</button>
            ${question ? `<button class="btn danger" type="button" data-delete-question="${course.id}" data-question="${questionIndex}">Delete question</button>` : ""}
          </div>
        </form>
        <form id="assignmentAdminForm" class="tool-panel" data-course="${course.id}" data-assignment="${assignment?.id || ""}">
          <h2>Assignment</h2>
          <div class="form-grid">
            ${inputField("title", "Title", assignment?.title || "")}
            ${inputField("due", "Due", assignment?.due || "")}
            ${inputField("maxPoints", "Points", assignment?.maxPoints || 10, "", "number")}
            ${textareaField("prompt", "Prompt", assignment?.prompt || "", "full")}
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit">Save assignment</button>
            <button class="btn secondary" type="button" data-add-assignment="${course.id}">Add assignment</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderStudentAdmin() {
  const selected = state.students.find((student) => student.id === routeParts()[2]) || state.students[0];
  if (!selected) return `<div class="empty-state">No students yet.</div>`;
  return `
    <div class="admin-layout">
      <aside class="tool-panel">
        <div class="admin-list">
          ${state.students
            .map(
              (student) =>
                `<a class="list-button ${student.id === selected.id ? "active" : ""}" href="#admin/students/${student.id}">
                  ${escapeHtml(student.name)}
                </a>`
            )
            .join("")}
        </div>
        <div class="form-actions">
          <button class="btn primary small" type="button" data-add-student>Add student</button>
        </div>
      </aside>
      <form id="studentForm" class="tool-panel" data-student="${selected.id}">
        <div class="form-grid">
          ${inputField("name", "Name", selected.name)}
          ${inputField("email", "Email", selected.email, "", "email")}
          ${inputField("status", "Status", selected.status)}
          ${textareaField("notes", "Notes", selected.notes, "full")}
          <label class="field full">
            <span>Enrolled courses</span>
            <select name="enrolledCourseIds" multiple size="${Math.min(state.courses.length, 6)}">
              ${state.courses
                .map(
                  (course) =>
                    `<option value="${course.id}" ${selected.enrolledCourseIds.includes(course.id) ? "selected" : ""}>${escapeHtml(
                      course.title
                    )}</option>`
                )
                .join("")}
            </select>
          </label>
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Save student</button>
          <button class="btn secondary" type="button" data-set-current-student="${selected.id}">Use on dashboard</button>
          <button class="btn danger" type="button" data-delete-student="${selected.id}">Delete student</button>
        </div>
      </form>
    </div>
  `;
}

function renderContactPage() {
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Contact</span>
        <h1>${escapeHtml(state.settings.cta)}</h1>
        <p class="lead">${escapeHtml(state.settings.location)} - ${escapeHtml(state.settings.availability)}</p>
      </div>
    </section>
    <section class="container detail-layout">
      <form id="contactForm" class="quiz-panel">
        <div class="form-grid">
          ${inputField("name", "Your name", "")}
          ${inputField("email", "Email", "", "", "email")}
          ${inputField("subject", "Subject", "")}
          ${inputField("phone", "Phone", "")}
          ${textareaField("message", "Message", "", "full")}
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Send message</button>
        </div>
      </form>
      <aside class="side-panel">
        <h3>Contact details</h3>
        <ul class="compact-list">
          <li class="compact-item"><span>Email</span><a href="mailto:${escapeAttr(state.settings.email)}">${escapeHtml(state.settings.email)}</a></li>
          <li class="compact-item"><span>Phone</span><a href="tel:${escapeAttr(state.settings.phone)}">${escapeHtml(state.settings.phone)}</a></li>
          <li class="compact-item"><span>Location</span><span>${escapeHtml(state.settings.location)}</span></li>
        </ul>
      </aside>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <strong>${escapeHtml(state.settings.name)}</strong>
          <p class="muted">${escapeHtml(state.settings.role)}</p>
        </div>
        <div class="footer-links">
          <a href="#courses">Courses</a>
          <a href="#dashboard">Student dashboard</a>
          ${isAdminAuthenticated() ? `<a href="#admin">Admin</a>` : ""}
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  `;
}

function renderNotFound(message, backHref) {
  return `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">Not found</span>
        <h1>${escapeHtml(message)}</h1>
        <a class="btn primary" href="${backHref}">Go back</a>
      </div>
    </section>
  `;
}

function bindPage(parts) {
  const [page] = parts;
  if (page === "courses") bindCourseFilters();
  if (page === "admin" && isAdminAuthenticated()) bindAdminControls();
}

function bindCourseFilters() {
  const search = document.querySelector("#courseSearch");
  const subject = document.querySelector("#subjectFilter");
  const level = document.querySelector("#levelFilter");
  [search, subject, level].forEach((control) => control?.addEventListener("input", filterCourses));
}

function filterCourses() {
  const q = document.querySelector("#courseSearch")?.value.toLowerCase().trim() || "";
  const subject = document.querySelector("#subjectFilter")?.value || "";
  const level = document.querySelector("#levelFilter")?.value || "";
  document.querySelectorAll("[data-course-card]").forEach((card) => {
    const matchesText = card.dataset.title.toLowerCase().includes(q);
    const matchesSubject = !subject || card.dataset.subject === subject;
    const matchesLevel = !level || card.dataset.level === level;
    card.style.display = matchesText && matchesSubject && matchesLevel ? "" : "none";
  });
}

function bindAdminControls() {
  const lessonCourseSelect = document.querySelector("#lessonCourseSelect");
  lessonCourseSelect?.addEventListener("change", (event) => {
    window.location.hash = `#admin/lessons/${event.target.value}/0/0`;
  });

  const lessonSelect = document.querySelector("#lessonSelect");
  lessonSelect?.addEventListener("change", (event) => {
    const form = document.querySelector("#lessonForm");
    window.location.hash = `#admin/lessons/${form.dataset.course}/${form.dataset.module}/${event.target.value}`;
  });

  const assessmentCourseSelect = document.querySelector("#assessmentCourseSelect");
  assessmentCourseSelect?.addEventListener("change", (event) => {
    window.location.hash = `#admin/assessments/${event.target.value}/0`;
  });
}

function handleGlobalClicks(event) {
  const target = event.target.closest("button, a");
  if (!target) return;

  if (target.matches("[data-admin-logout]")) {
    event.preventDefault();
    setAdminSession(false);
    adminLoginError = "";
    showToast("Signed out");
    window.location.hash = "#home";
    render();
    return;
  }

  if (target.matches(ADMIN_ACTION_SELECTOR) && !isAdminAuthenticated()) {
    event.preventDefault();
    blockAdminAccess();
    return;
  }

  if (target.matches("[data-enroll]")) {
    const courseId = target.dataset.enroll;
    const student = currentStudent();
    if (!student.enrolledCourseIds.includes(courseId)) {
      student.enrolledCourseIds.push(courseId);
      saveState("Student enrolled");
      render();
    } else {
      showToast("Student already enrolled");
    }
  }

  if (target.matches("[data-complete-lesson]")) {
    const student = currentStudent();
    const key = `${target.dataset.module}-${target.dataset.lesson}`;
    const completed = getCompleted(student.id, target.dataset.completeLesson);
    if (!completed.includes(key)) completed.push(key);
    setCompleted(student.id, target.dataset.completeLesson, completed);
    saveState("Lesson completed");
    render();
  }

  if (target.matches("[data-add-course]")) {
    const course = createCourse();
    state.courses.push(course);
    saveState("Course added");
    window.location.hash = `#admin/courses/${course.id}`;
  }

  if (target.matches("[data-delete-course]")) {
    const id = target.dataset.deleteCourse;
    if (state.courses.length <= 1) return showToast("Keep at least one course");
    state.courses = state.courses.filter((course) => course.id !== id);
    saveState("Course deleted");
    window.location.hash = "#admin/courses";
  }

  if (target.matches("[data-add-module]")) {
    const course = findCourse(target.dataset.addModule);
    course.modules.push({
      title: "New Module",
      lessons: [createLesson()]
    });
    saveState("Module added");
    window.location.hash = `#admin/lessons/${course.id}/${course.modules.length - 1}/0`;
  }

  if (target.matches("[data-add-lesson]")) {
    const course = findCourse(target.dataset.addLesson);
    const module = course.modules[Number(target.dataset.module)];
    module.lessons.push(createLesson());
    saveState("Lesson added");
    window.location.hash = `#admin/lessons/${course.id}/${target.dataset.module}/${module.lessons.length - 1}`;
  }

  if (target.matches("[data-delete-lesson]")) {
    const course = findCourse(target.dataset.deleteLesson);
    const module = course.modules[Number(target.dataset.module)];
    if (module.lessons.length <= 1) return showToast("Keep at least one lesson");
    module.lessons.splice(Number(target.dataset.lesson), 1);
    saveState("Lesson deleted");
    window.location.hash = `#admin/lessons/${course.id}/${target.dataset.module}/0`;
  }

  if (target.matches("[data-add-question]")) {
    const course = findCourse(target.dataset.addQuestion);
    course.quiz ||= { title: `${course.title} Quiz`, questions: [] };
    course.quiz.questions.push({
      question: "New question",
      options: ["Option 1", "Option 2", "Option 3"],
      answer: 0
    });
    saveState("Question added");
    window.location.hash = `#admin/assessments/${course.id}/${course.quiz.questions.length - 1}`;
  }

  if (target.matches("[data-delete-question]")) {
    const course = findCourse(target.dataset.deleteQuestion);
    course.quiz.questions.splice(Number(target.dataset.question), 1);
    saveState("Question deleted");
    window.location.hash = `#admin/assessments/${course.id}/0`;
  }

  if (target.matches("[data-add-assignment]")) {
    const course = findCourse(target.dataset.addAssignment);
    course.assignments.push({
      id: slugify(`assignment-${Date.now()}`),
      title: "New assignment",
      due: "Friday",
      prompt: "Add assignment prompt.",
      maxPoints: 10
    });
    saveState("Assignment added");
    render();
  }

  if (target.matches("[data-add-student]")) {
    const student = {
      id: slugify(`student-${Date.now()}`),
      name: "New Student",
      email: "student@example.com",
      status: "Active",
      notes: "",
      enrolledCourseIds: []
    };
    state.students.push(student);
    state.progress[student.id] = {};
    state.submissions[student.id] = {};
    saveState("Student added");
    window.location.hash = `#admin/students/${student.id}`;
  }

  if (target.matches("[data-delete-student]")) {
    const id = target.dataset.deleteStudent;
    if (state.students.length <= 1) return showToast("Keep at least one student");
    state.students = state.students.filter((student) => student.id !== id);
    delete state.progress[id];
    delete state.quizResults[id];
    delete state.submissions[id];
    if (state.currentStudentId === id) state.currentStudentId = state.students[0].id;
    saveState("Student deleted");
    window.location.hash = "#admin/students";
  }

  if (target.matches("[data-set-current-student]")) {
    state.currentStudentId = target.dataset.setCurrentStudent;
    saveState("Dashboard student changed");
    render();
  }

  if (target.matches("[data-reset-demo]")) {
    state = clone(defaultState);
    saveState("Demo data reset");
    window.location.hash = "#admin/settings";
    render();
  }

  if (target.matches("[data-download-state]")) {
    downloadBackup();
  }
}

async function handleGlobalSubmit(event) {
  const form = event.target;
  if (form.id === "adminLoginForm") {
    event.preventDefault();
    const data = formData(form);
    const isValid = await verifyAdminLogin(data.username, data.password);
    if (!isValid) {
      adminLoginError = "Incorrect username or password.";
      render();
      showToast("Incorrect admin login");
      return;
    }

    adminLoginError = "";
    setAdminSession(true);
    const returnTo = form.dataset.returnTo || "#admin/settings";
    window.location.hash = returnTo.startsWith("#admin") ? returnTo : "#admin/settings";
    render();
    return;
  }

  if (ADMIN_FORM_IDS.has(form.id) && !isAdminAuthenticated()) {
    event.preventDefault();
    blockAdminAccess();
    return;
  }

  if (form.id === "settingsForm") {
    event.preventDefault();
    const data = formData(form);
    state.settings = { ...state.settings, ...data };
    saveState("Settings saved");
    render();
  }

  if (form.id === "courseForm") {
    event.preventDefault();
    const course = findCourse(form.dataset.course);
    const data = formData(form);
    Object.assign(course, {
      title: data.title,
      subject: data.subject,
      level: data.level,
      duration: data.duration,
      description: data.description,
      outcomes: lines(data.outcomes),
      tags: data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
    saveState("Course saved");
    render();
  }

  if (form.id === "lessonForm") {
    event.preventDefault();
    const course = findCourse(form.dataset.course);
    const module = course.modules[Number(form.dataset.module)];
    const lesson = module.lessons[Number(form.dataset.lesson)];
    const data = formData(form);
    module.title = data.moduleTitle;
    Object.assign(lesson, {
      title: data.title,
      type: data.type,
      minutes: Number(data.minutes) || 0,
      videoUrl: data.videoUrl,
      content: data.content,
      resources:
        data.resourceLabel || data.resourceUrl
          ? [{ label: data.resourceLabel || "Resource", url: data.resourceUrl || "#" }]
          : []
    });
    saveState("Lesson saved");
    render();
  }

  if (form.id === "quizAdminForm") {
    event.preventDefault();
    const course = findCourse(form.dataset.course);
    const data = formData(form);
    course.quiz ||= { title: data.quizTitle, questions: [] };
    course.quiz.title = data.quizTitle;
    if (course.quiz.questions[Number(form.dataset.question)]) {
      course.quiz.questions[Number(form.dataset.question)] = {
        question: data.question,
        options: lines(data.options),
        answer: Math.max(0, Number(data.answer) - 1)
      };
    }
    saveState("Quiz saved");
    render();
  }

  if (form.id === "assignmentAdminForm") {
    event.preventDefault();
    const course = findCourse(form.dataset.course);
    const data = formData(form);
    if (!course.assignments.length) {
      course.assignments.push({ id: slugify(`assignment-${Date.now()}`) });
    }
    const assignment =
      course.assignments.find((item) => item.id === form.dataset.assignment) || course.assignments[0];
    Object.assign(assignment, {
      title: data.title,
      due: data.due,
      prompt: data.prompt,
      maxPoints: Number(data.maxPoints) || 0
    });
    saveState("Assignment saved");
    render();
  }

  if (form.id === "studentForm") {
    event.preventDefault();
    const student = state.students.find((item) => item.id === form.dataset.student);
    const data = formData(form);
    const selectedCourses = Array.from(form.elements.enrolledCourseIds.selectedOptions).map((option) => option.value);
    Object.assign(student, {
      name: data.name,
      email: data.email,
      status: data.status,
      notes: data.notes,
      enrolledCourseIds: selectedCourses
    });
    state.progress[student.id] ||= {};
    selectedCourses.forEach((courseId) => {
      state.progress[student.id][courseId] ||= [];
    });
    saveState("Student saved");
    render();
  }

  if (form.id === "quizForm") {
    event.preventDefault();
    const course = findCourse(form.dataset.course);
    const quiz = course.quiz;
    const data = new FormData(form);
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (Number(data.get(`q-${index}`)) === Number(question.answer)) correct += 1;
    });
    const score = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0;
    const student = currentStudent();
    state.quizResults[student.id] ||= {};
    state.quizResults[student.id][course.id] = { score, total: 100 };
    saveState(`Quiz submitted: ${score}/100`);
    render();
  }

  if (form.id === "assignmentForm") {
    event.preventDefault();
    const data = formData(form);
    const student = currentStudent();
    state.submissions[student.id] ||= {};
    state.submissions[student.id][form.dataset.assignment] = {
      response: data.response,
      link: data.link,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    };
    saveState("Assignment submitted");
    render();
  }

  if (form.id === "contactForm") {
    event.preventDefault();
    form.reset();
    showToast("Message prepared");
  }
}

function isAdminAuthenticated() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function setAdminSession(isAuthenticated) {
  try {
    if (isAuthenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Session storage can be unavailable in strict browser privacy modes.
  }
}

async function verifyAdminLogin(username = "", password = "") {
  if (username.trim().toLowerCase() !== ADMIN_USERNAME.toLowerCase()) return false;
  const hash = await sha256(password);
  return hash === ADMIN_PASSWORD_HASH;
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle) return "";
  const data = new TextEncoder().encode(String(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function blockAdminAccess() {
  adminLoginError = "Please sign in to continue.";
  showToast("Admin login required");
  window.location.hash = "#admin";
  render();
}

function inputField(name, label, value, className = "", type = "text") {
  return `
    <label class="field ${className}">
      <span>${escapeHtml(label)}</span>
      <input name="${escapeAttr(name)}" type="${escapeAttr(type)}" value="${escapeAttr(value ?? "")}" />
    </label>
  `;
}

function textareaField(name, label, value, className = "") {
  return `
    <label class="field ${className}">
      <span>${escapeHtml(label)}</span>
      <textarea name="${escapeAttr(name)}">${escapeHtml(value ?? "")}</textarea>
    </label>
  `;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function findCourse(id) {
  return state.courses.find((course) => course.id === id);
}

function currentStudent() {
  return state.students.find((student) => student.id === state.currentStudentId) || state.students[0];
}

function getCompleted(studentId, courseId) {
  state.progress[studentId] ||= {};
  state.progress[studentId][courseId] ||= [];
  return state.progress[studentId][courseId];
}

function setCompleted(studentId, courseId, completed) {
  state.progress[studentId] ||= {};
  state.progress[studentId][courseId] = completed;
}

function progressPercent(studentId, courseId) {
  const course = findCourse(courseId);
  if (!course) return 0;
  const total = totalLessons(course);
  if (!total) return 0;
  return Math.round((getCompleted(studentId, courseId).length / total) * 100);
}

function totalLessons(course) {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

function flattenLessons(course) {
  return course.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({ module, moduleIndex, lesson, lessonIndex }))
  );
}

function videoEmbedUrl(url = "") {
  if (!url.trim()) return "";
  if (url.includes("youtube.com/embed") || url.includes("player.vimeo.com")) return url;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function createCourse() {
  const id = slugify(`new-course-${Date.now()}`);
  return {
    id,
    title: "New Course",
    subject: "English Language",
    level: "Beginner",
    duration: "4 weeks",
    description: "Add course description.",
    outcomes: ["Add outcome"],
    tags: ["Live lessons"],
    modules: [{ title: "New Module", lessons: [createLesson()] }],
    assignments: [],
    quiz: { title: "New Course Quiz", questions: [] }
  };
}

function createLesson() {
  return {
    title: "New Lesson",
    type: "Lesson",
    minutes: 20,
    videoUrl: "",
    content: "Add lesson content.",
    resources: []
  };
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "hafiz-fahad-lms-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Backup downloaded");
}

function showToast(message) {
  clearTimeout(toastTimer);
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => toast.remove(), 2600);
}

function paragraphs(text = "") {
  return lines(text)
    .map((line) => `<p class="copy">${escapeHtml(line)}</p>`)
    .join("");
}

function lines(text = "") {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}
