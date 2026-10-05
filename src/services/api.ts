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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'An error occurred while communicating with the server.');
  }

  return res.json();
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
