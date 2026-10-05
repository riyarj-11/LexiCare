import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { LearningActivity, AdaptiveFeedback } from '../types';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Award,
  Layers,
  Flame
} from 'lucide-react';

interface Props {
  initialActivityId?: number;
  initialSkillFilter?: string;
  onNavigate: (tab: string) => void;
}

export const AdaptiveLearningView: React.FC<Props> = ({ initialActivityId, initialSkillFilter, onNavigate }) => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<LearningActivity | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<string>(initialSkillFilter || 'All');
  const [loading, setLoading] = useState<boolean>(true);

  // Gameplay State
  const [gameStep, setGameStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [userErrors, setUserErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<AdaptiveFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Interactive Game-Specific State
  const [letterBuilderWord, setLetterBuilderWord] = useState<string[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities();
      setActivities(data);

      if (initialActivityId) {
        const found = data.find(a => a.id === initialActivityId);
        if (found) startGame(found);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = (activity: LearningActivity) => {
    setSelectedActivity(activity);
    setGameStep(0);
    setScore(0);
    setUserErrors([]);
    setLetterBuilderWord([]);
    setStartTime(Date.now());
    setShowFeedbackModal(false);

    // Parse JSON
    try {
      const content = JSON.parse(activity.contentJson);
      if (activity.type === 'LetterDiscrimination' && content.pairs) {
        setMaxScore(content.pairs.length);
      } else if (activity.type === 'WordBuilding' && content.words) {
        setMaxScore(content.words.length);
      } else if (activity.type === 'SpellingQuiz' && content.questions) {
        setMaxScore(content.questions.length);
      } else {
        setMaxScore(4);
      }
    } catch {
      setMaxScore(4);
    }
  };

  const handleFinishGame = async (finalScore: number, finalErrors: string[]) => {
    if (!selectedActivity) return;
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const studentId = user?.studentId || 1;

    try {
      const res = await api.submitActivityAttempt({
        studentId,
        activityId: selectedActivity.id,
        score: finalScore,
        maxScore,
        timeSpentSeconds,
        errorPatterns: finalErrors,
      });

      setFeedback(res);
      setShowFeedbackModal(true);

      if (res.accuracyPercentage >= 70) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to submit attempt:', err);
    }
  };

  // 1. LETTER DISCRIMINATION GAME HANDLER (e.g. B vs D Detective)
  const renderLetterDiscrimination = () => {
    if (!selectedActivity) return null;
    const content = JSON.parse(selectedActivity.contentJson);
    const pairs = content.pairs || [];
    const currentPair = pairs[gameStep];

    if (!currentPair) {
      return (
        <div className="text-center py-8">
          <p className="font-bold text-slate-700">Calculating your mastery...</p>
        </div>
      );
    }

    const handleChoice = (chosen: string) => {
      const isCorrect = chosen === currentPair.correct;
      const newScore = isCorrect ? score + 1 : score;
      const newErrors = isCorrect ? userErrors : [...userErrors, 'b_d_confusion'];

      if (isCorrect) {
        speak('Super! That is correct!');
      } else {
        speak("Let's remember: b has a belly forward, d has a diaper behind!");
      }

      setScore(newScore);
      setUserErrors(newErrors);

      if (gameStep + 1 < pairs.length) {
        setGameStep(gameStep + 1);
      } else {
        handleFinishGame(newScore, newErrors);
      }
    };

    return (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 font-semibold">
          💡 Anchor Tip: {content.anchorTip}
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Task {gameStep + 1} of {pairs.length}
          </span>
          <h3 className="text-2xl font-black text-slate-900">
            Find the letter for: <span className="text-teal-700 underline">"{currentPair.cue}"</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          {[currentPair.target, currentPair.distractor].sort().map((letter, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(letter)}
              className="p-8 rounded-3xl border-3 border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <span className="text-6xl sm:text-7xl font-black font-dyslexic text-slate-800">
                {letter}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 2. WORD BUILDING GAME HANDLER (e.g. Sound to Letter Builder)
  const renderWordBuilding = () => {
    if (!selectedActivity) return null;
    const content = JSON.parse(selectedActivity.contentJson);
    const words = content.words || [];
    const currentWordObj = words[gameStep];

    if (!currentWordObj) return null;

    const handleTileClick = (letter: string) => {
      const nextWord = [...letterBuilderWord, letter];
      setLetterBuilderWord(nextWord);

      if (nextWord.length === currentWordObj.target.length) {
        const formed = nextWord.join('');
        const isCorrect = formed.toLowerCase() === currentWordObj.target.toLowerCase();
        const newScore = isCorrect ? score + 1 : score;
        const newErrors = isCorrect ? userErrors : [...userErrors, 'phonetic_segmentation'];

        if (isCorrect) {
          speak(`Great! You built ${formed}!`);
        } else {
          speak(`Good try! That spelled ${formed}. The target was ${currentWordObj.target}.`);
        }

        setScore(newScore);
        setUserErrors(newErrors);

        setTimeout(() => {
          setLetterBuilderWord([]);
          if (gameStep + 1 < words.length) {
            setGameStep(gameStep + 1);
          } else {
            handleFinishGame(newScore, newErrors);
          }
        }, 700);
      }
    };

    return (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Word {gameStep + 1} of {words.length}</span>
          <button
            onClick={() => speak(currentWordObj.audioPrompt)}
            className="flex items-center gap-1.5 text-teal-700 hover:underline"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Phonemes: {currentWordObj.audioPrompt}</span>
          </button>
        </div>

        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
          <p className="text-xs uppercase font-bold text-purple-700 mb-1">Clue / Meaning</p>
          <h3 className="text-xl font-black text-purple-950">"{currentWordObj.hint}"</h3>
        </div>

        {/* Word Display Slots */}
        <div className="flex items-center justify-center gap-3 py-4">
          {Array.from({ length: currentWordObj.target.length }).map((_, idx) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-2xl border-2 border-dashed border-teal-400 bg-white flex items-center justify-center text-3xl font-black text-teal-800 shadow-xs"
            >
              {letterBuilderWord[idx] || ''}
            </div>
          ))}
        </div>

        {/* Letter Tiles to Tap */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-3">Tap letters in order:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentWordObj.scramble.map((tile: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTileClick(tile)}
                className="w-14 h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-2xl font-black shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {tile}
              </button>
            ))}
          </div>
        </div>

        {letterBuilderWord.length > 0 && (
          <button
            onClick={() => setLetterBuilderWord([])}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Letters</span>
          </button>
        )}
      </div>
    );
  };

  // 3. SPELLING QUIZ HANDLER (e.g. Spelling Power: C vs K)
  const renderSpellingQuiz = () => {
    if (!selectedActivity) return null;
    const content = JSON.parse(selectedActivity.contentJson);
    const questions = content.questions || [];
    const currentQ = questions[gameStep];

    if (!currentQ) return null;

    const handleChoice = (opt: string) => {
      const isCorrect = opt === currentQ.correct;
      const newScore = isCorrect ? score + 1 : score;
      const newErrors = isCorrect ? userErrors : [...userErrors, 'orthographic_spelling'];

      if (isCorrect) {
        speak('Spot on! Excellent spelling choice.');
      } else {
        speak(`Remember the rule: K takes E and I, C takes the other three!`);
      }

      setScore(newScore);
      setUserErrors(newErrors);

      if (gameStep + 1 < questions.length) {
        setGameStep(gameStep + 1);
      } else {
        handleFinishGame(newScore, newErrors);
      }
    };

    return (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold leading-relaxed">
          📖 Rule Anchor: {content.rule}
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Question {gameStep + 1} of {questions.length}
          </span>
          <h3 className="text-3xl font-black text-slate-900">
            {currentQ.prompt}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {currentQ.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(opt)}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/50 shadow-sm hover:shadow-md text-2xl font-black text-slate-800 transition-all active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const filteredActivities = activeTabFilter === 'All'
    ? activities
    : activities.filter(a => a.skillName.toLowerCase().includes(activeTabFilter.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Adaptive Learning Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Learning Challenges
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Games automatically adjust to your pace: higher scores increase the challenge, while tricky words receive extra guidance!
          </p>
        </div>

        <button
          onClick={() => onNavigate('progress')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Skill Progress Map</span>
        </button>
      </div>

      {/* ACTIVE GAME CONTAINER */}
      {selectedActivity ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Gamepad2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedActivity.title}</h2>
                <p className="text-xs text-slate-500">
                  Skill: {selectedActivity.skillName} • Difficulty Level {selectedActivity.difficultyLevel}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedActivity(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Exit Activity
            </button>
          </div>

          {/* Render specific game */}
          {selectedActivity.type === 'LetterDiscrimination' && renderLetterDiscrimination()}
          {selectedActivity.type === 'WordBuilding' && renderWordBuilding()}
          {selectedActivity.type === 'SpellingQuiz' && renderSpellingQuiz()}
          {selectedActivity.type !== 'LetterDiscrimination' &&
           selectedActivity.type !== 'WordBuilding' &&
           selectedActivity.type !== 'SpellingQuiz' && (
            <div className="text-center py-10 space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Guided Interactive Reading</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Ready to practice sentence reading and comprehension with word highlights?
              </p>
              <button
                onClick={() => onNavigate('reading')}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Open in Reading Assistant →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ACTIVITY CATALOG */
        <div className="space-y-6">
          {/* Skill Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {['All', 'Phonics', 'Word Recognition', 'Spelling', 'Reading', 'Comprehension'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveTabFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTabFilter === filter
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Activity Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-teal-200">
                      {act.skillName}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      +{act.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{act.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Difficulty: Level {act.difficultyLevel}
                  </div>
                  <button
                    onClick={() => startGame(act)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                  >
                    Play Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADAPTIVE FEEDBACK & LEVEL ADJUSTMENT MODAL */}
      {showFeedbackModal && feedback && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-black">
                {feedback.accuracyPercentage >= 90 ? '🏆' : feedback.accuracyPercentage >= 70 ? '🌟' : '💪'}
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {feedback.accuracyPercentage >= 90 ? 'Mastery Achieved!' : feedback.accuracyPercentage >= 70 ? 'Great Progress!' : 'Supportive Practice!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">{feedback.feedbackMessage}</p>
            </div>

            {/* Adaptive Adjustment Details */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-teal-950">
                <span>Adaptive Difficulty Engine:</span>
                <span className="bg-teal-200/80 px-2 py-0.5 rounded text-teal-900">
                  Target Level {feedback.nextRecommendedDifficulty}
                </span>
              </div>
              <p className="text-teal-800 leading-relaxed font-medium">
                {feedback.guidanceTip}
              </p>
            </div>

            {/* Gamification Rewards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">XP Earned</span>
                <span className="text-base font-black text-teal-700">+{feedback.xpEarned} XP</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">Streak</span>
                <span className="text-base font-black text-amber-600 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {feedback.currentStreak}d
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">Player Level</span>
                <span className="text-base font-black text-purple-700">Lvl {feedback.newLevel}</span>
              </div>
            </div>

            {/* New Achievements Unlocked */}
            {feedback.newlyEarnedAchievements && feedback.newlyEarnedAchievements.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  New Badge Unlocked: {feedback.newlyEarnedAchievements[0].title}! ✨
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  if (selectedActivity) startGame(selectedActivity);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedActivity(null);
                }}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
              >
                Choose Next Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
