// Fahad Academy — Demo Preview Data
// This data is shown to visitors exploring the LMS in demo mode

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

const formatDateStr = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
};

const getRelativeDateStr = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return formatDateStr(d);
};

const DEMO_DATA = {
  user: {
    name: 'Ahmed Khan',
    email: 'demo@fahadacademy.com',
    role: 'student',
    status: 'active',
    avatar: null,
    createdAt: now - 90 * dayMs
  },
  
  courses: [
    {
      id: 'demo-math',
      title: 'Mathematics — O Level / IGCSE',
      subject: 'Mathematics',
      description: 'Comprehensive O Level Mathematics preparation covering Algebra, Geometry, Statistics, and more.',
      progress: 72,
      totalLectures: 32,
      totalAssignments: 15,
      totalQuizzes: 8
    },
    {
      id: 'demo-python',
      title: 'Python Programming — Beginner',
      subject: 'Programming',
      description: 'Learn the fundamentals of Python programming from scratch. Variables, loops, functions, and data structures.',
      progress: 45,
      totalLectures: 24,
      totalAssignments: 10,
      totalQuizzes: 5
    },
    {
      id: 'demo-quran',
      title: 'Tajweed Rules — Proper Quran Recitation',
      subject: 'Quran with Tajweed',
      description: 'Master the rules of Tajweed to recite the Holy Quran with proper pronunciation and articulation.',
      progress: 88,
      totalLectures: 18,
      totalAssignments: 4,
      totalQuizzes: 6
    }
  ],

  assignments: [
    {
      id: 'a1',
      title: 'Linear Equations Practice Set',
      courseId: 'demo-math',
      courseName: 'Mathematics — O Level / IGCSE',
      dueDate: now + 2 * dayMs,
      status: 'pending',
      score: null,
      points: 50
    },
    {
      id: 'a2',
      title: 'Loops and Conditionals Exercise',
      courseId: 'demo-python',
      courseName: 'Python Programming — Beginner',
      dueDate: now + 5 * dayMs,
      status: 'pending',
      score: null,
      points: 100
    },
    {
      id: 'a3',
      title: 'Algebraic Fractions Worksheet',
      courseId: 'demo-math',
      courseName: 'Mathematics — O Level / IGCSE',
      dueDate: now - 1 * dayMs,
      status: 'submitted',
      score: null,
      points: 50
    },
    {
      id: 'a4',
      title: 'Variables and Data Types in Python',
      courseId: 'demo-python',
      courseName: 'Python Programming — Beginner',
      dueDate: now - 2 * dayMs,
      status: 'submitted',
      score: null,
      points: 100
    },
    {
      id: 'a5',
      title: 'Makharij Al-Huroof Quiz Worksheet',
      courseId: 'demo-quran',
      courseName: 'Tajweed Rules — Proper Quran Recitation',
      dueDate: now - 7 * dayMs,
      status: 'graded',
      score: 45,
      points: 50
    },
    {
      id: 'a6',
      title: 'Functions & Graphs Problem Set',
      courseId: 'demo-math',
      courseName: 'Mathematics — O Level / IGCSE',
      dueDate: now - 14 * dayMs,
      status: 'graded',
      score: 95,
      points: 100
    }
  ],

  quizzes: [
    {
      id: 'q1',
      title: 'Module 3: Functions and Graphs',
      courseId: 'demo-math',
      courseName: 'Mathematics — O Level / IGCSE',
      duration: 30,
      questions: 15,
      status: 'completed',
      score: 92
    },
    {
      id: 'q2',
      title: 'Introduction to Tajweed Concepts',
      courseId: 'demo-quran',
      courseName: 'Tajweed Rules — Proper Quran Recitation',
      duration: 20,
      questions: 10,
      status: 'completed',
      score: 85
    },
    {
      id: 'q3',
      title: 'Python Data Structures',
      courseId: 'demo-python',
      courseName: 'Python Programming — Beginner',
      duration: 45,
      questions: 20,
      status: 'not_started',
      score: null
    },
    {
      id: 'q4',
      title: 'Geometry and Trigonometry Mid-Term',
      courseId: 'demo-math',
      courseName: 'Mathematics — O Level / IGCSE',
      duration: 60,
      questions: 30,
      status: 'not_started',
      score: null
    }
  ],

  lectures: [
    { id: 'l1', title: 'Introduction to Algebra', courseId: 'demo-math', courseName: 'Mathematics — O Level / IGCSE', duration: '35 mins', thumbnail: null },
    { id: 'l2', title: 'Solving Linear Equations', courseId: 'demo-math', courseName: 'Mathematics — O Level / IGCSE', duration: '42 mins', thumbnail: null },
    { id: 'l3', title: 'Quadratic Equations Explained', courseId: 'demo-math', courseName: 'Mathematics — O Level / IGCSE', duration: '50 mins', thumbnail: null },
    { id: 'l4', title: 'Setting Up Your Python Environment', courseId: 'demo-python', courseName: 'Python Programming — Beginner', duration: '20 mins', thumbnail: null },
    { id: 'l5', title: 'Variables and Basic Data Types', courseId: 'demo-python', courseName: 'Python Programming — Beginner', duration: '38 mins', thumbnail: null },
    { id: 'l6', title: 'Control Flow: If/Else and Loops', courseId: 'demo-python', courseName: 'Python Programming — Beginner', duration: '45 mins', thumbnail: null },
    { id: 'l7', title: 'The Importance of Tajweed', courseId: 'demo-quran', courseName: 'Tajweed Rules — Proper Quran Recitation', duration: '25 mins', thumbnail: null },
    { id: 'l8', title: 'Makharij: Articulation Points of Arabic Letters', courseId: 'demo-quran', courseName: 'Tajweed Rules — Proper Quran Recitation', duration: '55 mins', thumbnail: null },
    { id: 'l9', title: 'Rules of Noon Sakinah and Tanween', courseId: 'demo-quran', courseName: 'Tajweed Rules — Proper Quran Recitation', duration: '40 mins', thumbnail: null }
  ],

  liveClasses: [
    {
      id: 'lc1',
      title: 'Weekly Q&A: Mathematics O Level',
      subject: 'Mathematics',
      date: getRelativeDateStr(0),
      time: '18:00',
      platform: 'Zoom',
      joinUrl: 'https://zoom.us/j/demo12345',
      courseId: 'demo-math'
    },
    {
      id: 'lc2',
      title: 'Python Coding Workshop',
      subject: 'Programming',
      date: getRelativeDateStr(2),
      time: '17:30',
      platform: 'Google Meet',
      joinUrl: 'https://meet.google.com/demo-abc-xyz',
      courseId: 'demo-python'
    },
    {
      id: 'lc3',
      title: 'Live Recitation & Correction',
      subject: 'Quran with Tajweed',
      date: getRelativeDateStr(4),
      time: '19:00',
      platform: 'Zoom',
      joinUrl: 'https://zoom.us/j/demo67890',
      courseId: 'demo-quran'
    },
    {
      id: 'lc4',
      title: 'Previous Week: Algebra Review',
      subject: 'Mathematics',
      date: getRelativeDateStr(-1),
      time: '18:00',
      platform: 'Zoom',
      joinUrl: 'https://zoom.us/j/demo11122',
      courseId: 'demo-math'
    }
  ],

  quizAttempts: [
    { quizId: 'q1', score: 13.8, totalPoints: 15, percentage: 92, completedAt: now - 3 * dayMs },
    { quizId: 'q2', score: 8.5, totalPoints: 10, percentage: 85, completedAt: now - 10 * dayMs }
  ],

  recentActivity: [
    { type: 'quiz_completed', message: 'Scored 92% on Module 3: Functions and Graphs', timestamp: now - 3 * dayMs },
    { type: 'assignment_submitted', message: 'Submitted: Algebraic Fractions Worksheet', timestamp: now - 1 * dayMs },
    { type: 'lecture_watched', message: 'Watched: Quadratic Equations Explained', timestamp: now - 2 * dayMs },
    { type: 'assignment_submitted', message: 'Submitted: Variables and Data Types in Python', timestamp: now - 2 * dayMs + 3600000 },
    { type: 'lecture_watched', message: 'Watched: Control Flow: If/Else and Loops', timestamp: now - 4 * dayMs },
    { type: 'lecture_watched', message: 'Watched: Rules of Noon Sakinah and Tanween', timestamp: now - 5 * dayMs },
    { type: 'quiz_completed', message: 'Scored 85% on Introduction to Tajweed Concepts', timestamp: now - 10 * dayMs },
    { type: 'assignment_graded', message: 'Scored 95/100 on Functions & Graphs Problem Set', timestamp: now - 12 * dayMs }
  ],

  courseProgress: {
    'demo-math': { lecturesWatched: 23, totalLectures: 32 },
    'demo-python': { lecturesWatched: 11, totalLectures: 24 },
    'demo-quran': { lecturesWatched: 16, totalLectures: 18 }
  },

  demoCourseDetail: {
    course: {
      id: 'demo-math',
      title: 'Mathematics — O Level / IGCSE',
      subject: 'Mathematics',
      description: 'Comprehensive O Level Mathematics preparation covering Algebra, Geometry, Statistics, and more.',
      longDescription: 'This comprehensive course is designed specifically for O Level and IGCSE students. It covers all major topics including Algebra, Geometry, Trigonometry, Statistics, and Probability. Through interactive lessons, practical examples, and regular assessments, students will develop strong problem-solving skills and mathematical reasoning to excel in their board examinations.',
      objectives: [
        'Master algebraic expressions and equations',
        'Understand geometric properties and apply trigonometric ratios',
        'Analyze data using statistical methods and probability',
        'Develop critical thinking and problem-solving techniques',
        'Prepare effectively for O Level / IGCSE final exams'
      ],
      modules: [
        { title: 'Module 1: Algebra Fundamentals', lessonCount: 8 },
        { title: 'Module 2: Geometry and Mensuration', lessonCount: 6 },
        { title: 'Module 3: Trigonometry', lessonCount: 5 },
        { title: 'Module 4: Statistics and Probability', lessonCount: 7 },
        { title: 'Module 5: Exam Preparation & Past Papers', lessonCount: 6 }
      ]
    },
    lectures: [
      { id: 'dcl1', title: 'Algebra Basics', duration: '15 mins', videoId: 'NybHckSEQBI', type: 'video' },
      { id: 'dcl2', title: 'Linear Equations', duration: '22 mins', videoId: 'kpCJyQ2usJ4', type: 'video' },
      { id: 'dcl3', title: 'Quadratic Equations', duration: '18 mins', videoId: 'H0q9Fqb8YR4', type: 'video' },
      { id: 'dcl4', title: 'Functions', duration: '25 mins', videoId: 'WR9qCSXJlyY', type: 'video' },
      { id: 'dcl5', title: 'Trigonometry', duration: '30 mins', videoId: 'rAof9Ld5sOg', type: 'video' }
    ],
    materials: [
      { id: 'm1', title: 'Algebra Formula Sheet', type: 'pdf', size: '1.2 MB' },
      { id: 'm2', title: 'Past Paper 2023 - P1', type: 'pdf', size: '3.5 MB' },
      { id: 'm3', title: 'Geometry Practice Questions', type: 'doc', size: '800 KB' }
    ],
    assignments: [
      { id: 'dca1', title: 'Linear Equations Practice Set', dueDate: now + 2 * dayMs, status: 'pending', points: 50 },
      { id: 'dca2', title: 'Algebraic Fractions Worksheet', dueDate: now - 1 * dayMs, status: 'submitted', points: 50 },
      { id: 'dca3', title: 'Functions & Graphs Problem Set', dueDate: now - 14 * dayMs, status: 'graded', score: 95, points: 100 }
    ],
    quizzes: [
      { id: 'dcq1', title: 'Module 3: Functions and Graphs', duration: 30, questions: 15, status: 'completed', score: 92 },
      { id: 'dcq2', title: 'Geometry and Trigonometry Mid-Term', duration: 60, questions: 30, status: 'not_started', score: null }
    ]
  }
};

export default DEMO_DATA;
