import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProfile, AssignmentItem, LearningActivity } from '../types';
import {
  Flame,
  Zap,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Volume2
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const studentId = user?.studentId || 1;
      const [profileData, assignData, actData] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentAssignments(studentId),
        api.getActivities()
      ]);
      setStudent(profileData);
      setAssignments(assignData);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-teal-800">Loading your reading adventures...</p>
        </div>
      </div>
    );
  }

  const studentName = student?.fullName || 'Aarav';
  const streak = student?.currentStreak || 5;
  const xp = student?.totalXp || 480;
  const level = student?.level || 3;
  const skills = student?.skills || [];
  const achievements = student?.achievements || [];

  // Recommended activity based on lowest skill score
  const lowestSkill = [...skills].sort((a, b) => a.currentScore - b.currentScore)[0];
  const recommendedActivity = activities.find(a => a.skillName === lowestSkill?.skillName) || activities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Friendly Welcome & Gamification Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-teal-700/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Grade {student?.gradeLevel || 3} Learning Journey</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {studentName}! 🌟
          </h1>
          <p className="text-teal-100 text-sm mt-1 max-w-xl">
            You're on a roll! Ready to explore today's words and earn more XP?
          </p>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-black/15 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="text-left">
              <span className="block text-xs text-teal-100 font-medium">Daily Streak</span>
              <span className="text-lg font-black text-white">{streak} Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="w-9 h-9 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-teal-300" />
            </div>
            <div className="text-left">
              <span className="block text-xs text-teal-100 font-medium">Total XP</span>
              <span className="text-lg font-black text-white">{xp} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="w-9 h-9 rounded-full bg-purple-400/20 text-purple-300 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs text-teal-100 font-medium">Level</span>
              <span className="text-lg font-black text-white">Lvl {level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Spotlight Card */}
      {recommendedActivity && (
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-amber-500 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Recommended For You
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {recommendedActivity.title}
              </h2>
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                {recommendedActivity.description}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-amber-900 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{recommendedActivity.estimatedMinutes} mins
                </span>
                <span className="flex items-center gap-1 text-teal-700">
                  <Zap className="w-3.5 h-3.5 fill-teal-700" />
                  +{recommendedActivity.xpReward} XP Reward
                </span>
                <span className="bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                  Skill: {recommendedActivity.skillName}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('learning', { activityId: recommendedActivity.id })}
              className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-600/20 flex items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <span>Start Activity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid: Daily Learning Practice & Assignments */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Practice Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Daily Learning Adventures
            </h2>
            <button
              onClick={() => onNavigate('learning')}
              className="text-teal-700 hover:text-teal-800 text-xs font-bold flex items-center gap-1"
            >
              <span>View All Activities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Phonics Exercise */}
            <div
              onClick={() => onNavigate('learning', { skillFilter: 'Phonics' })}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Phonics & Sounds</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Letter-sound matching, rhyming words, and sound building puzzles.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Practice Sounds</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Word Recognition */}
            <div
              onClick={() => onNavigate('learning', { skillFilter: 'Word Recognition' })}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Word Recognition (b/d)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visual letter discrimination, sight words, and detective challenges.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Play Detective</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Spelling Practice */}
            <div
              onClick={() => onNavigate('learning', { skillFilter: 'Spelling' })}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Spelling Patterns</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rules like C vs K, silent 'e', and phonetic transcription puzzles.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-purple-700">
                <span>Master Spelling</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Reading Assistant */}
            <div
              onClick={() => onNavigate('reading')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Reading Assistant</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enjoy stories with OpenDyslexic font, sentence ruler, and text-to-speech.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Open Library</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Teacher Assignments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              Assigned by Your Teacher
            </h3>

            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending assignments right now. Enjoy free practice!</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{asg.title}</p>
                      <p className="text-xs text-slate-500">{asg.instructions}</p>
                      <p className="text-[11px] text-teal-700 font-semibold mt-1">
                        From: {asg.teacherName} • Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('learning', { activityId: asg.activityId })}
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shrink-0"
                    >
                      {asg.isCompleted ? 'Review' : 'Start Task'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skill Progress Map & Achievements */}
        <div className="space-y-6">
          {/* Skill Progress Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Skill Progress Map
              </h3>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Detailed Map
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.skillId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{skill.skillName}</span>
                    <span className="font-extrabold text-teal-800">{Math.round(skill.currentScore)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.currentScore >= 80
                          ? 'bg-emerald-500'
                          : skill.currentScore >= 65
                          ? 'bg-teal-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, skill.currentScore))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Level: {skill.level} ({skill.totalAttempts} attempts)
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('screening')}
                className="w-full py-2.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors text-center block"
              >
                Take Screening Checkup
              </button>
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Badges & Milestones
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const unlocked = !!ach.earnedAt;
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      unlocked
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold leading-tight">{ach.title}</p>
                    <span className="text-[10px] font-semibold text-amber-700 block mt-1">
                      {unlocked ? 'Unlocked! ✨' : `+${ach.xpBonus} XP`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
