import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  Smile,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const ParentDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    setLoading(true);
    try {
      const parentId = user?.parentId || 1;
      const data = await api.getParentDashboard(parentId);
      setParentData(data);
    } catch (err) {
      console.error('Failed to load parent dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-teal-800">Loading your child's progress overview...</p>
        </div>
      </div>
    );
  }

  const parent = parentData?.parent || {};
  const children = parentData?.children || [];
  const primaryChild = children[0] || {
    fullName: 'Aarav',
    gradeLevel: 3,
    age: 8,
    friendlySummary: 'Aarav is improving in reading comprehension but needs additional practice with phonics.',
    skillsImproving: ['Comprehension', 'Vocabulary'],
    skillsNeedingPractice: ['Phonics', 'Spelling'],
    weeklyGoalMinutes: 60,
    minutesPracticedThisWeek: 45,
    recentActivities: [],
    teacherRecommendation: 'Practice 5-minute tactile letter tracing games at home with enthusiastic praise!'
  };

  const progressPercent = Math.min(
    100,
    Math.round((primaryChild.minutesPracticedThisWeek / primaryChild.weeklyGoalMinutes) * 100)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Friendly Parent Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-teal-800/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>Parent Support Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {parent.fullName || 'Priya'}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Here is how <strong>{primaryChild.fullName}</strong> is growing in reading this week. No confusing medical jargon—just clear, loving insights.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports', { studentId: primaryChild.studentId })}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all shrink-0"
        >
          <FileText className="w-4 h-4 text-teal-700" />
          <span>View Progress Report</span>
        </button>
      </div>

      {/* Main Narrative Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Smile className="w-7 h-7" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-extrabold uppercase text-teal-700 tracking-wider">
              Weekly Overview for {primaryChild.fullName}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              "{primaryChild.friendlySummary}"
            </h2>
            <p className="text-xs text-slate-500 pt-1">
              Based on recent reading exercises and school checkups.
            </p>
          </div>
        </div>

        {/* Weekly Goal Progress Bar */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600" />
              Weekly Reading Practice Time
            </span>
            <span className="text-teal-800 font-black">
              {primaryChild.minutesPracticedThisWeek} of {primaryChild.weeklyGoalMinutes} mins ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dual Cards: Skills Improving vs Skills Needing Practice */}
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {/* Skills Improving */}
          <div className="p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Skills Blooming & Growing 🌟</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {primaryChild.fullName} is showing confident understanding and high accuracy in:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryChild.skillsImproving.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-950 font-bold text-xs shadow-2xs"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Needing Gentle Practice */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Focus Areas for Home Fun 💡</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              A little daily 5-minute practice will build strong confidence in:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryChild.skillsNeedingPractice.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold text-xs shadow-2xs"
                >
                  🌱 {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher & AI Guidance in Plain Language */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          Educator Recommendation for Home
        </h3>

        <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs sm:text-sm text-teal-950 leading-relaxed space-y-2">
          <p className="font-semibold">
            "{primaryChild.teacherRecommendation}"
          </p>
          <p className="text-teal-800 text-xs font-normal">
            Tip: Try the "Bed" hand gesture (making thumbs-up fists to resemble a bed) when reading at bedtime. It turns tricky letters into a playful game!
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>Ask LexiCare AI Assistant a question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate('learning')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
          >
            Launch Today's 5-Minute Practice
          </button>
        </div>
      </div>

      {/* Safety & Educational Assurance */}
      <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-500 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
        <span>
          <strong>Parent Note:</strong> LexiCare provides supportive educational observations and is not a medical diagnosis. Every child develops at their own unique pace!
        </span>
      </div>
    </div>
  );
};
