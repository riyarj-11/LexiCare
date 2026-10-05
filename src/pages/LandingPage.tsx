import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  BrainCircuit,
  Sparkles,
  Gamepad2,
  Glasses,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  School,
  HeartHandshake
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const { loginDemo } = useAuth();

  const handleRoleStart = async (role: 'Student' | 'Teacher' | 'Parent') => {
    await loginDemo(role);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-teal-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Educational Screening & Support System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Every child deserves the joy of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500">
                confident reading
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Many children with reading and writing difficulties go unnoticed because early assessment is hard to access. 
              <strong className="text-slate-900 font-semibold"> LexiCare</strong> bridges that gap with age-appropriate educational screening, 
              adaptive phonics games, and personalized support for students, parents, and teachers.
            </p>

            {/* Prominent Educational Notice */}
            <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-2xl max-w-2xl mx-auto text-xs text-teal-900 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Educational Support Only:</strong> LexiCare identifies learning patterns to guide practice and does not claim to medically diagnose dyslexia.
              </span>
            </div>

            {/* Quick Demo Exploration CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => handleRoleStart('Student')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Try Student Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleRoleStart('Teacher')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all hover:scale-[1.02]"
              >
                <School className="w-4 h-4 text-teal-600" />
                <span>Explore Teacher Portal</span>
              </button>

              <button
                onClick={() => handleRoleStart('Parent')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all hover:scale-[1.02]"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>View Parent Overview</span>
              </button>
            </div>

            {/* App Visual Showcase */}
            <div className="mt-14 relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 ring-1 ring-slate-200">
              <img
                src="/hero-preview.jpg"
                alt="LexiCare Child-Friendly Learning Interface Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 right-6 text-white flex items-center justify-between text-xs font-semibold drop-shadow-md">
                <span>Interactive Phonics, Reading Focus Ruler & Adaptive Milestones</span>
                <span className="bg-teal-500/90 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full">
                  Live Demo Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem & Our Solution */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                The Real-World Challenge
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Why Early Educational Screening Matters
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Up to 1 in 5 children experience difficulties with reading fluency, decoding, or spelling. 
                Too often, parents and teachers mistake this for a lack of effort. Formal assessments often take months or years to access, leaving young minds struggling in silence.
              </p>
              <div className="space-y-3.5">
                {[
                  'Unrecognized signs like letter confusion (b/d) and phonetic spelling (cat → kat)',
                  'Lack of individualized, research-informed multisensory practice at home',
                  'Disconnect between school observation and home support',
                  'Anxiety and loss of confidence during timed reading exercises'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✕
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-8 rounded-3xl border border-teal-200/80 shadow-sm space-y-6">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                The LexiCare Solution
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                Connected, Compassionate & Adaptive Support
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                LexiCare provides a unified platform connecting students, parents, and educators. 
                Rather than labeling a student, we identify specific learning patterns and immediately offer targeted, engaging activities.
              </p>

              <div className="space-y-3">
                {[
                  'Objective screening across Phonics, Spelling, Reading & Comprehension',
                  'Adaptive Learning Engine that dynamically scales difficulty to avoid fatigue',
                  'Distraction-free Reading Assistant with dyslexia typography and TTS word tracking',
                  'Plain-language parent summaries and actionable teacher progress reports'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Modules Showcase */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A Complete Ecosystem for Reading Growth
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Engineered with clean architecture, accessible typography, and Orton-Gillingham pedagogical principles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive Screening</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Age-appropriate tasks evaluating letter discrimination, rhyming, phoneme segmentation, and comprehension with audio prompts.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
                <span>Non-clinical result tiers</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Learning Engine</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Automatically adjusts difficulty based on mastery (≥90% level up, &lt;70% scaffold with visual cues) across 6 core literacy skills.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span>Visual progress map</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <Glasses className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Reading Assistant</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Distraction-free environment with OpenDyslexic font, sentence focus ruler, syllable separation, and synchronized text-to-speech.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
                <span>Karaoke word tracker</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Teacher Command Center</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Manage classroom rosters, spot struggling skills at a glance, assign targeted exercises, and track homework completion.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
                <span>Individualized plans</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Professional Progress Reports</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Comprehensive skill breakdowns, documented error patterns, educator action plans, and 1-click printable PDF exports.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
                <span>Shareable with specialists</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Pedagogical Assistant</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Answers parent & teacher questions in plain language without medical jargon, recommending multi-sensory strategies.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-semibold">
                <span>Safe educational guidance</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Commitment */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                Inclusive by Design
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
                Built from the ground up for neurodiverse learners
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                LexiCare incorporates evidence-based accessibility features: heavy-bottomed OpenDyslexic typography, high-contrast themes, variable line and letter spacing, synchronized text-to-speech, and color-independent visual indicators so learners never rely on color alone for correctness.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('reading')}
                  className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all"
                >
                  Test Reading Assistant Now
                </button>
                <button
                  onClick={() => onNavigate('screening')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
                >
                  Start Educational Screening
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">LexiCare AI Dyslexia Support Platform</p>
          <p className="mt-1">
            Production-quality full-stack system built with React, TypeScript, ASP.NET Core Web API, EF Core, and SQLite/SQL Server.
          </p>
          <p className="mt-2 text-slate-400">
            * This screening is for educational support only and does not constitute a medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
};
