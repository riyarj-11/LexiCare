import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Type, Eye, Volume2, MoveHorizontal, AlignJustify, Sparkles } from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    highContrast,
    setHighContrast,
    readingRulerEnabled,
    setReadingRulerEnabled,
    speechRate,
    setSpeechRate,
    speak,
    stopSpeech,
    isSpeaking
  } = useAccessibility();

  const handleTestAudio = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speak("Welcome to LexiCare. Dyslexia friendly reading support is active.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-teal-200 bg-white/90 text-teal-800 hover:bg-teal-50 shadow-sm transition-all focus:ring-2 focus:ring-teal-500"
        title="Accessibility & Typography Settings"
        aria-label="Open accessibility settings panel"
        aria-expanded={isOpen}
      >
        <Eye className="w-4 h-4 text-teal-600" />
        <span className="hidden sm:inline">Accessibility</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 p-5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Reading & Accessibility
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Font Family */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-teal-600" />
                Font Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFontFamily('lexend')}
                  className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                    fontFamily === 'lexend'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Lexend
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('dyslexic')}
                  className={`py-1.5 px-2 rounded-lg border font-medium font-dyslexic transition-all ${
                    fontFamily === 'dyslexic'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  OpenDyslexic
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('comic')}
                  className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                    fontFamily === 'comic'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Casual
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Text Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`py-1 px-2 rounded-lg border ${
                    fontSize === 'normal'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`py-1 px-2 rounded-lg border ${
                    fontSize === 'large'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Large
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`py-1 px-2 rounded-lg border ${
                    fontSize === 'xlarge'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Extra Large
                </button>
              </div>
            </div>

            {/* Line & Letter Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1">
                  <AlignJustify className="w-3 h-3 text-teal-600" />
                  Line Spacing
                </label>
                <select
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                >
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="loose">Wide</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1">
                  <MoveHorizontal className="w-3 h-3 text-teal-600" />
                  Letter Spacing
                </label>
                <select
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                >
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                  <option value="extra">Extra Wide</option>
                </select>
              </div>
            </div>

            {/* High Contrast & Reading Ruler Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">High Contrast Mode</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">Reading Focus Ruler</span>
                <input
                  type="checkbox"
                  checked={readingRulerEnabled}
                  onChange={(e) => setReadingRulerEnabled(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Audio Speech Controls */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                  Speech Speed ({speechRate}x)
                </label>
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="text-teal-700 font-bold hover:underline"
                >
                  {isSpeaking ? 'Stop' : 'Test Voice'}
                </button>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.3"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
