import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentSkillProgress } from '../types';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  BrainCircuit,
  Compass,
  Zap
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const ProgressMapView: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<StudentSkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, [user]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const studentId = user?.studentId || 1;
      const data = await api.getStudentSkills(studentId);
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skill progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-teal-800">Generating your skill progress map...</p>
        </div>
      </div>
    );
  }

  const overallAverage = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.currentScore, 0) / skills.length)
    : 70;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Mastery Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skill-Based Progress Map
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            Watch your reading superpowers expand! Each node tracks your accuracy, attempts, and developmental level.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0">
          <span className="text-xs text-teal-200 block font-medium">Overall Composite Score</span>
          <span className="text-3xl font-black text-white">{overallAverage}%</span>
          <span className="text-[10px] text-teal-300 block font-bold mt-0.5">Developing Steadily</span>
        </div>
      </div>

      {/* Progress Cards Matrix */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const score = Math.round(skill.currentScore);
          const isMastered = score >= 85;
          const isProficient = score >= 70 && score < 85;
          const isDeveloping = score < 70;

          return (
            <div
              key={skill.skillId}
              className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {skill.category}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      isMastered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isProficient
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{skill.skillName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {skill.totalAttempts} practice attempts completed
                  </p>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Mastery Level</span>
                    <span className="text-teal-800 font-black">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMastered ? 'bg-emerald-500' : isProficient ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                    />
                  </div>
                </div>

                {/* Error Patterns Tag */}
                {skill.commonErrorPatterns && skill.commonErrorPatterns.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Focus Pattern:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skill.commonErrorPatterns.map((err, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold"
                        >
                          {err.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Last: {new Date(skill.lastPracticedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onNavigate('learning', { skillFilter: skill.skillName })}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
                >
                  Practice Now →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
