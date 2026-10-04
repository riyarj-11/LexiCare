import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { ReadingMaterial } from '../types';
import {
  Glasses,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Volume2,
  Sliders,
  Type,
  Sun,
  Moon,
  Coffee,
  CheckCircle,
  PlusCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';

export const ReadingAssistant: React.FC = () => {
  const {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    speechRate,
    setSpeechRate,
    speak,
    stopSpeech,
    isSpeaking
  } = useAccessibility();

  // Reading Assistant State
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<ReadingMaterial | null>(null);
  const [theme, setTheme] = useState<'default' | 'sepia' | 'dark' | 'contrast'>('default');
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [currentSpokenWordIndex, setCurrentSpokenWordIndex] = useState<number>(-1);
  const [syllableMode, setSyllableMode] = useState<boolean>(false);
  const [readingRuler, setReadingRuler] = useState<boolean>(true);
  const [customTextModalOpen, setCustomTextModalOpen] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const list = await api.getReadingMaterials();
      setMaterials(list);
      if (list.length > 0) {
        setActiveMaterial(list[0]);
      }
    } catch (err) {
      console.error('Failed to load reading materials:', err);
    }
  };

  const handleSelectMaterial = (m: ReadingMaterial) => {
    stopSpeech();
    setActiveMaterial(m);
    setActiveSentenceIndex(0);
    setCurrentSpokenWordIndex(-1);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleAddCustomText = async () => {
    if (!customText.trim()) return;
    try {
      const created = await api.createCustomReadingMaterial({
        title: customTitle.trim() || 'My Custom Story',
        contentText: customText,
        gradeLevel: 3,
        category: 'Custom'
      });
      setMaterials([created, ...materials]);
      setActiveMaterial(created);
      setCustomTextModalOpen(false);
      setCustomText('');
      setCustomTitle('');
    } catch (err) {
      console.error('Failed to create custom material:', err);
    }
  };

  const sentences = activeMaterial?.contentText
    ? activeMaterial.contentText.split(/(?<=[.?!])\s+/).filter(Boolean)
    : [];

  const handlePlayTTS = () => {
    if (isSpeaking) {
      stopSpeech();
      setCurrentSpokenWordIndex(-1);
    } else {
      if (!activeMaterial) return;
      const textToRead = sentences[activeSentenceIndex] || activeMaterial.contentText;

      speak(
        textToRead,
        (wordIdx) => {
          setCurrentSpokenWordIndex(wordIdx);
        },
        () => {
          setCurrentSpokenWordIndex(-1);
          // Auto advance sentence
          if (activeSentenceIndex + 1 < sentences.length) {
            setActiveSentenceIndex(activeSentenceIndex + 1);
          }
        }
      );
    }
  };

  // Helper to split word into syllables if syllable mode is active
  const formatWord = (rawWord: string) => {
    if (!syllableMode || !activeMaterial) return rawWord;
    const clean = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    const hyphenated = activeMaterial.syllableBreakdown[clean];
    if (hyphenated) {
      return hyphenated;
    }
    return rawWord;
  };

  const currentSentence = sentences[activeSentenceIndex] || '';
  const wordsInSentence = currentSentence.split(' ');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Glasses className="w-3.5 h-3.5 text-teal-600" />
            Distraction-Free Reading Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Focus & Read Comfortably
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Customize typography, toggle syllable separation, and follow words with synchronized text-to-speech.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCustomTextModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Paste Custom Text</span>
          </button>

          {/* Reading Library Selector */}
          <select
            value={activeMaterial?.id || ''}
            onChange={(e) => {
              const found = materials.find((m) => m.id === parseInt(e.target.value));
              if (found) handleSelectMaterial(found);
            }}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} (Grade {m.gradeLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Strip (Theme, Font, Ruler, Syllables, Audio) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Themes */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTheme('default')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              theme === 'default' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
            title="Clean Light Theme"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            onClick={() => setTheme('sepia')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              theme === 'sepia' ? 'bg-[#fcf6e8] text-[#3b2f20] shadow-xs' : 'text-slate-600'
            }`}
            title="Warm Sepia for reduced eye strain"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Warm Sepia</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
            }`}
            title="Calm Dark Theme"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Font Family Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFontFamily('lexend')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              fontFamily === 'lexend' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            Lexend
          </button>
          <button
            onClick={() => setFontFamily('dyslexic')}
            className={`px-2.5 py-1.5 rounded-lg font-dyslexic transition-all ${
              fontFamily === 'dyslexic' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            OpenDyslexic
          </button>
          <button
            onClick={() => setFontFamily('comic')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              fontFamily === 'comic' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            Casual
          </button>
        </div>

        {/* Features: Ruler & Syllables */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSyllableMode(!syllableMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              syllableMode
                ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Syllables: {syllableMode ? 'ON (Ol-i-ver)' : 'OFF'}
          </button>

          <button
            onClick={() => setReadingRuler(!readingRuler)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              readingRuler
                ? 'bg-teal-100 border-teal-300 text-teal-900 shadow-xs'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Focus Ruler: {readingRuler ? 'Active' : 'Hidden'}
          </button>
        </div>

        {/* TTS Play / Pause Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayTTS}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
              isSpeaking ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Read Sentence Aloud</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              stopSpeech();
              setActiveSentenceIndex(0);
              setCurrentSpokenWordIndex(-1);
            }}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* READING VIEWPORT CONTAINER */}
      {activeMaterial && (
        <div
          className={`rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm transition-colors duration-200 relative overflow-hidden ${
            theme === 'sepia'
              ? 'theme-sepia'
              : theme === 'dark'
              ? 'theme-dark'
              : theme === 'contrast'
              ? 'theme-high-contrast'
              : 'bg-white'
          }`}
        >
          {/* Passage Meta info */}
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6 text-xs opacity-75">
            <span className="font-bold uppercase tracking-wider">{activeMaterial.category}</span>
            <span>
              Lexile: <strong>{activeMaterial.lexileLevel}</strong> • {activeMaterial.wordCount} words
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-8">{activeMaterial.title}</h2>

          {/* Sentence by Sentence Reading Display */}
          <div
            className={`space-y-4 ${
              fontSize === 'xlarge' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg'
            } ${
              lineSpacing === 'loose' ? 'leading-[2.4]' : lineSpacing === 'relaxed' ? 'leading-[2.0]' : 'leading-[1.7]'
            } ${
              letterSpacing === 'extra' ? 'tracking-[0.08em]' : letterSpacing === 'wide' ? 'tracking-[0.04em]' : 'tracking-normal'
            }`}
          >
            {sentences.map((sentence, sIdx) => {
              const isActive = sIdx === activeSentenceIndex;
              const words = sentence.split(' ');

              return (
                <div
                  key={sIdx}
                  onClick={() => {
                    stopSpeech();
                    setActiveSentenceIndex(sIdx);
                    setCurrentSpokenWordIndex(-1);
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    readingRuler
                      ? isActive
                        ? 'bg-amber-300/30 ring-2 ring-amber-400 font-medium'
                        : 'opacity-40 hover:opacity-70'
                      : isActive
                      ? 'bg-teal-500/10'
                      : ''
                  }`}
                >
                  {words.map((word, wIdx) => {
                    const isWordSpeaking = isActive && isSpeaking && currentSpokenWordIndex === wIdx;
                    return (
                      <span
                        key={wIdx}
                        className={`inline-block mr-2 px-1 rounded-md transition-colors ${
                          isWordSpeaking
                            ? 'bg-amber-400 text-slate-950 font-black scale-105 shadow-xs'
                            : ''
                        }`}
                      >
                        {formatWord(word)}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Sentence Navigation Footbar */}
          <div className="mt-10 pt-6 border-t border-black/10 flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => {
                stopSpeech();
                setActiveSentenceIndex(Math.max(0, activeSentenceIndex - 1));
              }}
              disabled={activeSentenceIndex === 0}
              className="px-4 py-2 rounded-xl border border-black/20 hover:bg-black/5 disabled:opacity-30"
            >
              ← Previous Sentence
            </button>

            <span>
              Sentence {activeSentenceIndex + 1} of {sentences.length}
            </span>

            <button
              onClick={() => {
                stopSpeech();
                setActiveSentenceIndex(Math.min(sentences.length - 1, activeSentenceIndex + 1));
              }}
              disabled={activeSentenceIndex === sentences.length - 1}
              className="px-4 py-2 rounded-xl border border-black/20 hover:bg-black/5 disabled:opacity-30"
            >
              Next Sentence →
            </button>
          </div>
        </div>
      )}

      {/* COMPREHENSION CHECKUP SECTION */}
      {activeMaterial && activeMaterial.comprehensionQuestions && activeMaterial.comprehensionQuestions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              Reading Comprehension Checkup
            </h3>
            <span className="text-xs text-slate-500">Test what you learned from the story!</span>
          </div>

          <div className="space-y-6">
            {activeMaterial.comprehensionQuestions.map((q, qIdx) => {
              const userAnswer = quizAnswers[qIdx];
              const isCorrect = userAnswer === q.answer;

              return (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-bold text-slate-900">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const selected = userAnswer === opt;
                      let btnStyle = 'border-slate-200 hover:bg-slate-50 text-slate-800';

                      if (quizSubmitted) {
                        if (opt === q.answer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                        } else if (selected) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                        }
                      } else if (selected) {
                        btnStyle = 'border-teal-600 bg-teal-50 text-teal-950 font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: opt })}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(quizAnswers).length < activeMaterial.comprehensionQuestions.length}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs"
            >
              Check Answers
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700">
                Well done! Review your results above.
              </span>
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM PASSAGE MODAL */}
      {customTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Paste Your Reading Material</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste school homework, a favorite story, or a chapter. LexiCare will instantly generate syllable separations, sentence focus guides, and audio narration.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Chapter 3: The Golden Key"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Passage Text</label>
                <textarea
                  rows={6}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste story text here..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCustomTextModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomText}
                disabled={!customText.trim()}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs"
              >
                Load into Reading Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
