import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { ScreeningQuestion, ScreeningResult } from '../types';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const ScreeningFlow: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  // State
  const [stage, setStage] = useState<'intro' | 'screening' | 'results'>('intro');
  const [selectedAge, setSelectedAge] = useState<number>(8);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [spellingInput, setSpellingInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState<boolean>(true);

  // Load questions on age select or mount
  useEffect(() => {
    loadQuestions();
  }, [selectedAge]);

  const loadQuestions = async () => {
    try {
      const data = await api.getScreeningQuestions(selectedAge);
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleStartScreening = async () => {
    if (!disclaimerAgreed) return;
    setIsLoading(true);
    try {
      const studentId = user?.studentId || 1;
      const session = await api.startScreening(studentId);
      setSessionId(session.sessionId);
      setCurrentIndex(0);
      setSelectedOption(null);
      setSpellingInput('');
      setStartTime(Date.now());
      setStage('screening');

      // Auto-read first question audio prompt
      if (questions.length > 0 && questions[0].audioPromptText) {
        setTimeout(() => speak(questions[0].audioPromptText), 500);
      }
    } catch (err) {
      console.error('Failed to start screening session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handlePlayAudio = () => {
    if (currentQ?.audioPromptText) {
      speak(currentQ.audioPromptText);
    } else if (currentQ?.questionText) {
      speak(currentQ.questionText);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentQ || !sessionId) return;

    const answer = currentQ.options.length > 0 ? (selectedOption || '') : spellingInput;
    if (!answer) return;

    const responseTimeMs = Date.now() - startTime;

    try {
      await api.submitScreeningAnswer({
        sessionId,
        questionId: currentQ.id,
        selectedAnswer: answer,
        responseTimeMs,
      });

      if (currentIndex + 1 < questions.length) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setSelectedOption(null);
        setSpellingInput('');
        setStartTime(Date.now());

        if (questions[nextIdx]?.audioPromptText) {
          setTimeout(() => speak(questions[nextIdx].audioPromptText), 400);
        }
      } else {
        // Complete screening
        setIsLoading(true);
        const finalResult = await api.completeScreening(sessionId);
        setResult(finalResult);
        setStage('results');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. INTRO STAGE
  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Educational Reading Screener
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Personalized Reading & Phonics Checkup
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            This friendly, multi-stage checkup helps identify how you recognize letters, connect sounds, spell words, and understand stories.
          </p>
        </div>

        {/* Clear Educational Disclaimer Box */}
        <EducationalDisclaimer variant="card" />

        {/* Age / Grade Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Select Age / Grade Level:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { age: 7, label: 'Age 7 (Grade 2)' },
              { age: 8, label: 'Age 8 (Grade 3)' },
              { age: 9, label: 'Age 9 (Grade 4)' },
              { age: 10, label: 'Age 10+ (Grade 5)' },
            ].map((item) => (
              <button
                key={item.age}
                type="button"
                onClick={() => setSelectedAge(item.age)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                  selectedAge === item.age
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tasks prepared: {questions.length} interactive questions</span>
            <span>Estimated time: ~6–8 minutes</span>
          </div>
        </div>

        {/* What to Expect Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            What the checkup covers:
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              <span><strong>Reading:</strong> Letter orientation (b/d) & sight words</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Phonics:</strong> Letter-sound matching & rhyming</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <span><strong>Spelling:</strong> Phonetic patterns & silent-e rules</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Comprehension:</strong> Short passage & main ideas</span>
            </div>
          </div>
        </div>

        {/* Agreement checkbox & Start CTA */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={disclaimerAgreed}
              onChange={(e) => setDisclaimerAgreed(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
            <span>
              I understand that this screening is for <strong>educational guidance only</strong> and does not constitute a medical diagnosis.
            </span>
          </label>

          <button
            onClick={handleStartScreening}
            disabled={!disclaimerAgreed || isLoading || questions.length === 0}
            className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Begin Educational Screening</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. ACTIVE SCREENING STAGE
  if (stage === 'screening' && currentQ) {
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Progress Bar & Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {currentQ.category}
            </span>
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Question Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Audio Prompt Button & Visual Cue */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug whitespace-pre-line">
                {currentQ.questionText}
              </h2>
            </div>

            <button
              onClick={handlePlayAudio}
              className="p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 shrink-0 shadow-xs transition-colors"
              title="Listen to question audio"
              aria-label="Read question aloud"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Visual Cue if present (e.g. b or d or image) */}
          {currentQ.visualCue && (
            <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100 text-center">
              <span className="text-5xl font-black text-teal-900 font-dyslexic inline-block animate-bounce">
                {currentQ.visualCue}
              </span>
            </div>
          )}

          {/* Answer Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(opt)}
                    className={`p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Open input if spelling */
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-600">Type your answer below:</label>
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                placeholder="Type here..."
                className="w-full p-4 rounded-xl border-2 border-slate-300 focus:border-teal-600 text-lg font-bold outline-none"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePlayAudio}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear prompt again</span>
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={(!selectedOption && !spellingInput.trim()) || isLoading}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition-transform active:scale-95"
          >
            <span>{currentIndex + 1 === questions.length ? 'Complete Screening' : 'Next Task'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. RESULTS STAGE
  if (stage === 'results' && result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        {/* Banner with Clear Non-Clinical Result Classification */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="bg-teal-100 text-teal-800 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full">
              Educational Screening Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Observation Summary
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Completed on {new Date().toLocaleDateString()} with {result.totalQuestions} interactive tasks
            </p>
          </div>

          {/* Result Classification Card */}
          <div
            className={`p-6 rounded-2xl border-2 text-center space-y-2 ${
              result.difficultySummary.includes('No significant')
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : result.difficultySummary.includes('Some areas')
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">
              Screening Observation:
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{result.difficultySummary}</h2>
            <p className="text-xs sm:text-sm max-w-xl mx-auto font-medium">
              Your responses indicate that you may benefit from additional support in specific learning areas below.
            </p>
          </div>

          {/* Educational Disclaimer */}
          <EducationalDisclaimer variant="card" />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium block">Overall Accuracy</span>
              <span className="text-2xl font-black text-teal-700">{result.accuracyRate}%</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium block">Correct Answers</span>
              <span className="text-2xl font-black text-slate-800">
                {result.correctAnswers} / {result.totalQuestions}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium block">Avg Response Time</span>
              <span className="text-2xl font-black text-slate-800">
                {(result.averageResponseTimeMs / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium block">Patterns Noted</span>
              <span className="text-2xl font-black text-purple-700">
                {result.detectedPatterns.length}
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Skill Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(result.categoryBreakdown).map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-teal-800">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Practice Activities */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Recommended Practice Areas
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.recommendedFocusAreas.map((area, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">{area}</span>
                  <button
                    onClick={() => onNavigate('learning')}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Start Practice →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setStage('intro')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Screening</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('reports')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm"
            >
              View Full Progress Report
            </button>
            <button
              onClick={() => onNavigate('learning')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
            >
              Go to Personalized Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
