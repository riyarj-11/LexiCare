export type UserRole = 'Student' | 'Parent' | 'Teacher' | 'Admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: number;
  parentId?: number;
  teacherId?: number;
}

export interface StudentSkillProgress {
  skillId: number;
  skillName: string;
  category: string;
  currentScore: number;
  level: string;
  accuracyRate: number;
  totalAttempts: number;
  lastPracticedAt: string;
  commonErrorPatterns: string[];
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  badgeType: string;
  xpBonus: number;
  earnedAt?: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  gradeLevel: number;
  age: number;
  preferredTheme: string;
  dyslexiaFontEnabled: boolean;
  textSize: string;
  currentStreak: number;
  totalXp: number;
  level: number;
  skills: StudentSkillProgress[];
  achievements: Achievement[];
}

export interface ScreeningQuestion {
  id: number;
  category: string;
  subCategory: string;
  questionText: string;
  audioPromptText: string;
  visualCue?: string;
  options: string[];
  difficultyLevel: number;
  explanation: string;
}

export interface ScreeningResult {
  sessionId: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  averageResponseTimeMs: number;
  difficultySummary: string;
  observationsSummary: string;
  categoryBreakdown: Record<string, number>;
  detectedPatterns: string[];
  recommendedFocusAreas: string[];
  disclaimer: string;
}

export interface LearningActivity {
  id: number;
  skillId: number;
  skillName: string;
  title: string;
  description: string;
  type: string;
  difficultyLevel: number;
  contentJson: string;
  estimatedMinutes: number;
  xpReward: number;
}

export interface AdaptiveFeedback {
  accuracyPercentage: number;
  xpEarned: number;
  currentStreak: number;
  newTotalXp: number;
  newLevel: number;
  nextRecommendedDifficulty: number;
  feedbackMessage: string;
  guidanceTip: string;
  newlyEarnedAchievements: Achievement[];
}

export interface ReadingMaterial {
  id: number;
  title: string;
  gradeLevel: number;
  category: string;
  contentText: string;
  audioNarrationText: string;
  lexileLevel: string;
  wordCount: number;
  syllableBreakdown: Record<string, string>;
  comprehensionQuestions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface AssignmentItem {
  id: number;
  title: string;
  instructions: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  activityId: number;
  activityTitle: string;
  activityType: string;
  teacherName: string;
}

export interface ProgressReport {
  id: number;
  studentId: number;
  studentName: string;
  age: number;
  gradeLevel: number;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  overallSummary: string;
  skillBreakdown: Record<string, number>;
  commonErrorsSummary: string;
  recommendedActionPlan: string;
  disclaimerText: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  recommendedActivities?: string[];
}
