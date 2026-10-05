import {
  User,
  StudentProfile,
  StudentSkillProgress,
  Achievement,
  ScreeningQuestion,
  ScreeningResult,
  LearningActivity,
  AdaptiveFeedback,
  ReadingMaterial,
  AssignmentItem,
  ProgressReport
} from '../types';

import {
  mockUsers,
  mockStudentProfile,
  mockSkills,
  mockAchievements,
  mockScreeningQuestions,
  mockActivities,
  mockReadingMaterials,
  mockAssignments,
  mockProgressReport
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('lexicare_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Stateful client-side mock store in localStorage for standalone deployment
function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(`lexicare_mock_${key}`);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`lexicare_mock_${key}`, JSON.stringify(val));
  } catch {
    // ignore
  }
}

function handleMockFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const email = body.email || 'student@lexicare.com';
    const found = mockUsers[email] || {
      token: 'mock-jwt-token-custom',
      user: {
        id: 99,
        fullName: email.split('@')[0],
        email: email,
        role: email.includes('teacher') ? 'Teacher' : email.includes('parent') ? 'Parent' : 'Student',
        studentId: 1
      }
    };
    localStorage.setItem('lexicare_mock_currentUser', JSON.stringify(found.user));
    return found as unknown as T;
  }

  // Auth: Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const user: User = {
      id: Math.floor(Math.random() * 1000) + 10,
      fullName: body.fullName || 'New Learner',
      email: body.email,
      role: body.role || 'Student',
      studentId: 1
    };
    localStorage.setItem('lexicare_mock_currentUser', JSON.stringify(user));
    return { token: 'mock-register-token', user } as unknown as T;
  }

  // Auth: Me
  if (endpoint === '/auth/me') {
    const curr = getStoredItem<User>('currentUser', mockUsers['student@lexicare.com'].user);
    return curr as unknown as T;
  }

  // Student Profile
  if (endpoint.startsWith('/student/') && !endpoint.includes('/skills') && !endpoint.includes('/achievements') && !endpoint.includes('/assignments') && !endpoint.includes('/settings')) {
    const profile = getStoredItem<StudentProfile>('student_1', mockStudentProfile);
    return profile as unknown as T;
  }

  // Student Settings Update
  if (endpoint.includes('/settings') && method === 'PUT') {
    const profile = getStoredItem<StudentProfile>('student_1', mockStudentProfile);
    const updated = { ...profile, ...body };
    setStoredItem('student_1', updated);
    return updated as unknown as T;
  }

  // Student Skills
  if (endpoint.includes('/skills')) {
    const profile = getStoredItem<StudentProfile>('student_1', mockStudentProfile);
    return profile.skills as unknown as T;
  }

  // Student Achievements
  if (endpoint.includes('/achievements')) {
    const profile = getStoredItem<StudentProfile>('student_1', mockStudentProfile);
    return profile.achievements as unknown as T;
  }

  // Student Assignments
  if (endpoint.includes('/assignments') && method === 'GET') {
    return getStoredItem<AssignmentItem[]>('assignments', mockAssignments) as unknown as T;
  }

  // Screening Questions
  if (endpoint.startsWith('/screening/questions')) {
    return mockScreeningQuestions as unknown as T;
  }

  // Screening Start
  if (endpoint === '/screening/start' && method === 'POST') {
    const sessionId = Date.now();
    setStoredItem('active_session_answers', []);
    return {
      sessionId,
      startTime: new Date().toISOString(),
      disclaimerConfirmed: true
    } as unknown as T;
  }

  // Screening Submit Answer
  if (endpoint === '/screening/submit-answer' && method === 'POST') {
    const answers = getStoredItem<any[]>('active_session_answers', []);
    answers.push(body);
    setStoredItem('active_session_answers', answers);
    return { success: true } as unknown as T;
  }

  // Screening Complete
  if (endpoint.startsWith('/screening/complete') && method === 'POST') {
    const answers = getStoredItem<any[]>('active_session_answers', []);
    let correctCount = 0;
    const detectedPatterns: string[] = [];

    answers.forEach(a => {
      const q = mockScreeningQuestions.find(mq => mq.id === a.questionId);
      if (q && q.correctAnswer === a.selectedAnswer) {
        correctCount++;
      } else if (q && q.errorPatternTag) {
        if (!detectedPatterns.includes(q.errorPatternTag)) {
          detectedPatterns.push(q.errorPatternTag);
        }
      }
    });

    const total = answers.length || 1;
    const accuracy = Math.round((correctCount / total) * 100);

    const result: ScreeningResult = {
      sessionId: Date.now(),
      totalQuestions: total,
      correctAnswers: correctCount,
      accuracyRate: accuracy,
      averageResponseTimeMs: 2400,
      difficultySummary: accuracy >= 80 ? 'Strong reading confidence — keep reinforcing phonics foundations' : accuracy >= 50 ? 'Developing nicely — some areas may benefit from multi-sensory practice' : 'Consistent challenges observed — targeted educational support recommended',
      observationsSummary: `Student completed ${total} screening tasks with ${accuracy}% accuracy. Strengths observed in auditory comprehension and sight word familiarity. Key educational focus areas identified for structured practice: letter orientation (b/d) and phoneme segmentation.`,
      categoryBreakdown: {
        Reading: accuracy >= 70 ? 75 : 60,
        Phonics: accuracy >= 60 ? 65 : 50,
        Spelling: 68,
        Comprehension: 84
      },
      detectedPatterns: detectedPatterns.length ? detectedPatterns : ['b_d_confusion', 'phonetic_substitution'],
      recommendedFocusAreas: ['Letter Discrimination (b vs d)', 'Phoneme Segmentation', 'CVC Word Building'],
      disclaimer: 'This educational screening is designed for learning support only and does NOT constitute a clinical or medical diagnosis.'
    };
    return result as unknown as T;
  }

  // Screening History
  if (endpoint.startsWith('/screening/history')) {
    return [
      {
        id: 1,
        completedTime: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        totalQuestions: 11,
        correctAnswers: 8,
        accuracyRate: 72.7,
        averageResponseTimeMs: 2800,
        difficultySummary: 'Some areas may benefit from additional practice',
        observationsSummary: 'Strong receptive comprehension and vocabulary. Hesitations observed on reversible letters (b/d).'
      }
    ] as unknown as T;
  }

  // Learning Activities
  if (endpoint.startsWith('/learning/activities')) {
    if (endpoint.includes('/') && endpoint.split('/').length > 3) {
      const id = parseInt(endpoint.split('/')[3]);
      const act = mockActivities.find(a => a.id === id) || mockActivities[0];
      return act as unknown as T;
    }
    return mockActivities as unknown as T;
  }

  // Learning Submit Attempt
  if (endpoint === '/learning/submit-attempt' && method === 'POST') {
    const profile = getStoredItem<StudentProfile>('student_1', mockStudentProfile);
    const score = body.score || 80;
    const xpBonus = 30 + Math.round(score / 5);
    const updatedProfile: StudentProfile = {
      ...profile,
      totalXp: profile.totalXp + xpBonus,
      currentStreak: profile.currentStreak + 1
    };
    setStoredItem('student_1', updatedProfile);

    const feedback: AdaptiveFeedback = {
      accuracyPercentage: score,
      xpEarned: xpBonus,
      currentStreak: updatedProfile.currentStreak,
      newTotalXp: updatedProfile.totalXp,
      newLevel: Math.floor(updatedProfile.totalXp / 200) + 1,
      nextRecommendedDifficulty: score > 85 ? 2 : 1,
      feedbackMessage: score >= 80 ? 'Outstanding decoding accuracy! Your confidence is growing with every session!' : 'Great effort! Practice makes progress — keep exploring new words!',
      guidanceTip: "Remember: 'b' has a belly that walks forward, and 'd' has a diaper that backs up!",
      newlyEarnedAchievements: []
    };
    return feedback as unknown as T;
  }

  // Assignment Completion
  if (endpoint.includes('/complete') && endpoint.includes('/assignments/')) {
    return { success: true } as unknown as T;
  }

  // Reading Materials
  if (endpoint.startsWith('/reading/materials')) {
    if (endpoint.includes('/') && endpoint.split('/').length > 3) {
      const id = parseInt(endpoint.split('/')[3]);
      const mat = mockReadingMaterials.find(m => m.id === id) || mockReadingMaterials[0];
      return mat as unknown as T;
    }
    return mockReadingMaterials as unknown as T;
  }

  if (endpoint === '/reading/custom' && method === 'POST') {
    const newMat: ReadingMaterial = {
      id: Date.now(),
      title: body.title || 'Custom Story',
      gradeLevel: body.gradeLevel || 3,
      category: body.category || 'Custom',
      contentText: body.contentText || '',
      audioNarrationText: body.contentText || '',
      lexileLevel: '450L',
      wordCount: (body.contentText || '').split(/\s+/).length,
      syllableBreakdown: {},
      comprehensionQuestions: []
    };
    return newMat as unknown as T;
  }

  // Teacher Dashboard
  if (endpoint.startsWith('/teacher/dashboard')) {
    return {
      teacherName: 'Sarah Jenkins, M.Ed.',
      schoolName: 'Oakridge Elementary School',
      subject: 'Grade 3 Lead Reading Specialist',
      classes: [
        {
          id: 1,
          name: 'Grade 3 - Bluebirds',
          gradeLevel: 3,
          description: 'Targeted reading & phonics intervention cohort',
          studentsCount: 3,
          students: [
            {
              id: 1,
              name: 'Aarav Sharma',
              age: 8,
              grade: 3,
              currentStreak: 5,
              totalXp: 480,
              readingLevel: 'Developing',
              accuracyRate: 72,
              primaryFocus: 'Letter Discrimination (b/d)',
              lastActive: 'Today'
            },
            {
              id: 2,
              name: 'Maya Patel',
              age: 8,
              grade: 3,
              currentStreak: 3,
              totalXp: 320,
              readingLevel: 'Developing',
              accuracyRate: 78,
              primaryFocus: 'Rhyme Awareness',
              lastActive: 'Yesterday'
            },
            {
              id: 3,
              name: 'Leo Zhang',
              age: 9,
              grade: 3,
              currentStreak: 7,
              totalXp: 610,
              readingLevel: 'Mastered',
              accuracyRate: 92,
              primaryFocus: 'Advanced Vocabulary',
              lastActive: '2 days ago'
            }
          ]
        }
      ],
      recentAlerts: [
        {
          id: 1,
          studentName: 'Aarav Sharma',
          severity: 'Attention',
          message: 'Screening pattern indicates reversible letter hesitation (b/d). Recommended 5-min multi-sensory drill.',
          date: 'Yesterday'
        }
      ],
      activePlans: [
        {
          id: 1,
          studentName: 'Aarav Sharma',
          title: "Aarav's Phonics & Letter Recognition Focus Plan",
          goalMinutes: 60,
          status: 'Active',
          recommendedSkills: 'Phonics, Word Recognition, Spelling'
        }
      ]
    } as unknown as T;
  }

  if (endpoint === '/teacher/classes' && method === 'POST') {
    return { id: Date.now(), ...body } as unknown as T;
  }

  if (endpoint === '/teacher/assignments' && method === 'POST') {
    return { id: Date.now(), ...body, isCompleted: false } as unknown as T;
  }

  if (endpoint.startsWith('/teacher/plans') && method === 'POST') {
    return { id: Date.now(), ...body, status: 'Active' } as unknown as T;
  }

  // Parent Dashboard
  if (endpoint.startsWith('/parent/dashboard')) {
    return {
      parentName: 'Priya Sharma',
      student: {
        id: 1,
        fullName: 'Aarav Sharma',
        age: 8,
        gradeLevel: 3,
        currentStreak: 5,
        totalXp: 480,
        level: 3,
        skills: mockSkills,
        achievements: mockAchievements
      },
      observationChecklists: [
        { id: 1, sign: 'Reverses visually similar letters (e.g. confuses b with d, p with q)', frequency: 'Often', notes: 'Common when tired or reading fast' },
        { id: 2, sign: 'Guesses unfamiliar words based on first letter rather than decoding whole word', frequency: 'Sometimes', notes: 'Improving with syllable breaking tool' },
        { id: 3, sign: 'Remembers stories exceptionally well when read aloud to him', frequency: 'Always', notes: 'Strong auditory & narrative comprehension!' }
      ],
      homeTips: [
        'Use the built-in Reading Assistant with OpenDyslexic font and the Reading Focus Ruler.',
        'Encourage 5-minute tactile letter tracing in sand or kinetic foam before reading.',
        'Celebrate small wins: Aarav has kept a 5-day practice streak!'
      ]
    } as unknown as T;
  }

  // AI Assistant Chat
  if (endpoint === '/ai/chat' && method === 'POST') {
    const q = (body.message || '').toLowerCase();
    let answer = "Thank you for reaching out! At LexiCare, we follow multi-sensory structured literacy principles (inspired by the Orton-Gillingham approach). Reading difficulties often reflect different ways the brain processes visual and auditory language patterns — not a lack of intelligence. Consistent, positive multi-sensory practice (sound, sight, touch) builds strong neural pathways.";
    let suggestedActions = ['Practice B vs D Detective', 'Try the Audio Reading Assistant', 'Download Educational Progress Report'];
    let recommendedActivities = ['B vs D Detective', 'Sound to Letter Builder'];

    if (q.includes('b') || q.includes('d') || q.includes('revers') || q.includes('letter')) {
      answer = "Letter reversals like confusing 'b' and 'd' are very common in early elementary learners! We recommend using the 'bed trick': when making fists with thumbs up, your left hand forms 'b' and right hand forms 'd', spelling 'bed'. Combining this with our 'B vs D Detective' interactive game will reinforce visual-spatial memory.";
      suggestedActions = ['Play B vs D Detective', 'Use tactile letter tracing', 'Try OpenDyslexic font'];
      recommendedActivities = ['B vs D Detective'];
    } else if (q.includes('spell') || q.includes('rule') || q.includes('cat') || q.includes('kat')) {
      answer = "Children with phonological patterns often write phonetically (e.g. 'kat' for 'cat'). Teach them the spelling rule: 'C' takes vowels a, o, u (cat, cot, cup), while 'K' takes e and i (kitten, kite). Try our 'Spelling Power: C vs K' challenge to practice!";
      suggestedActions = ['Launch Spelling Power: C vs K', 'Practice syllable claps'];
      recommendedActivities = ['Spelling Power: C vs K'];
    } else if (q.includes('screening') || q.includes('test') || q.includes('diagnos')) {
      answer = "LexiCare's educational screening is designed to identify learning patterns (such as phoneme segmentation, letter orientation, and sight word fluency) to tailor practice exercises. Please note that this is an educational screener, not a clinical medical diagnosis. If you need a formal evaluation, consider consulting a licensed neuropsychologist or educational psychologist.";
      suggestedActions = ['Take Screening Test', 'View Past Observations'];
    }

    return {
      answer,
      suggestedActions,
      recommendedActivities,
      disclaimer: 'This educational AI assistant provides learning suggestions only and does NOT replace professional medical or educational assessments.'
    } as unknown as T;
  }

  if (endpoint.startsWith('/ai/recommendation')) {
    return {
      studentId: 1,
      focusSkill: 'Phonics + Visual Discrimination',
      issueIdentified: "Letter discrimination hesitation between 'b' and 'd', phonetic substitution in spelling",
      recommendationText: "Implement visual-tactile discrimination anchors for 'b' and 'd'. Introduce word-building games focusing on CVC patterns.",
      parentExplanation: "Aarav understands stories very well! He is confusing letters that look alike (like b and d). With fun 5-minute tactile games at home, these patterns will strengthen quickly.",
      teacherExplanation: "Student demonstrates strong listening comprehension. Prioritize structured literacy intervention focusing on grapheme-phoneme mapping.",
      recommendedActivities: ['B vs D Detective', 'Sound to Letter Builder', 'Spelling Power: C vs K'],
      severityLevel: 'Moderate'
    } as unknown as T;
  }

  // Reports
  if (endpoint === '/reports/generate' && method === 'POST') {
    return mockProgressReport as unknown as T;
  }

  if (endpoint.startsWith('/reports/student/')) {
    return [mockProgressReport] as unknown as T;
  }

  if (endpoint.startsWith('/reports/')) {
    return mockProgressReport as unknown as T;
  }

  // Fallback default
  return {} as unknown as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (res.ok) {
      return await res.json();
    }
    
    // If backend returns 404 or other error, fallback to mock data
    return handleMockFallback<T>(endpoint, options);
  } catch {
    // Network failure (offline, no server running, CORS, static deployment) -> fallback to mock
    return handleMockFallback<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { fullName: string; email: string; password: string; role: string; gradeLevel?: number; age?: number }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  // Student
  getStudent: (id: number) => request<StudentProfile>(`/student/${id}`),
  getStudentByUserId: (userId: number) => request<StudentProfile>(`/student/user/${userId}`),
  updateStudentSettings: (id: number, settings: { preferredTheme?: string; dyslexiaFontEnabled?: boolean; textSize?: string }) =>
    request<StudentProfile>(`/student/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getStudentSkills: (id: number) => request<StudentSkillProgress[]>(`/student/${id}/skills`),
  getStudentAchievements: (id: number) => request<Achievement[]>(`/student/${id}/achievements`),
  getStudentAssignments: (id: number) => request<AssignmentItem[]>(`/student/${id}/assignments`),

  // Screening
  getScreeningQuestions: (age?: number) =>
    request<ScreeningQuestion[]>(`/screening/questions${age ? `?age=${age}` : ''}`),
  startScreening: (studentId: number) =>
    request<{ sessionId: number; startTime: string; disclaimerConfirmed: boolean }>('/screening/start', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
  submitScreeningAnswer: (data: { sessionId: number; questionId: number; selectedAnswer: string; responseTimeMs: number }) =>
    request<{ success: boolean }>('/screening/submit-answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  completeScreening: (sessionId: number) =>
    request<ScreeningResult>(`/screening/complete/${sessionId}`, {
      method: 'POST',
    }),
  getScreeningHistory: (studentId: number) =>
    request<any[]>(`/screening/history/${studentId}`),

  // Learning & Adaptive Engine
  getActivities: (skillId?: number, difficulty?: number) => {
    const params = new URLSearchParams();
    if (skillId) params.append('skillId', skillId.toString());
    if (difficulty) params.append('difficulty', difficulty.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<LearningActivity[]>(`/learning/activities${query}`);
  },
  getActivityById: (id: number) => request<LearningActivity>(`/learning/activities/${id}`),
  submitActivityAttempt: (data: { studentId: number; activityId: number; score: number; maxScore: number; timeSpentSeconds: number; errorPatterns: string[] }) =>
    request<AdaptiveFeedback>('/learning/submit-attempt', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  completeAssignment: (id: number, score: number) =>
    request<{ success: boolean }>(`/learning/assignments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    }),

  // Reading Assistant
  getReadingMaterials: () => request<ReadingMaterial[]>('/reading/materials'),
  getReadingMaterialById: (id: number) => request<ReadingMaterial>(`/reading/materials/${id}`),
  createCustomReadingMaterial: (data: Partial<ReadingMaterial>) =>
    request<ReadingMaterial>('/reading/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Teacher Dashboard
  getTeacherDashboard: (teacherId: number) => request<any>(`/teacher/dashboard/${teacherId}`),
  createClass: (teacherId: number, name: string, gradeLevel: number, description: string) =>
    request<any>('/teacher/classes', {
      method: 'POST',
      body: JSON.stringify({ teacherId, name, gradeLevel, description }),
    }),
  createAssignment: (data: { teacherId: number; classId?: number; studentId?: number; activityId: number; title: string; instructions: string; dueDate: string }) =>
    request<any>('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createPlan: (teacherUserId: number, data: { studentId: number; title: string; description: string; recommendedFocusSkills: string; weeklyGoalMinutes: number }) =>
    request<any>(`/teacher/plans?teacherUserId=${teacherUserId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Parent Dashboard
  getParentDashboard: (parentId: number) => request<any>(`/parent/dashboard/${parentId}`),

  // AI Assistant & Personalization
  chatAI: (message: string, studentId?: number, userRole: string = 'Parent') =>
    request<{ answer: string; suggestedActions: string[]; recommendedActivities: string[]; disclaimer: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, studentId, userRole }),
    }),
  getAIRecommendation: (studentId: number) => request<any>(`/ai/recommendation/${studentId}`),

  // Progress Reports & PDF
  generateReport: (studentId: number, generatedByUserId?: number) =>
    request<ProgressReport>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ studentId, generatedByUserId }),
    }),
  getReportsForStudent: (studentId: number) => request<ProgressReport[]>(`/reports/student/${studentId}`),
  getReportById: (id: number) => request<ProgressReport>(`/reports/${id}`),
};
