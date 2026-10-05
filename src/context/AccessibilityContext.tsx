import React, { createContext, useContext, useState, useEffect } from 'react';

type FontFamily = 'lexend' | 'dyslexic' | 'comic';
type FontSize = 'normal' | 'large' | 'xlarge';
type LineSpacing = 'normal' | 'relaxed' | 'loose';
type LetterSpacing = 'normal' | 'wide' | 'extra';

interface AccessibilityContextType {
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  lineSpacing: LineSpacing;
  setLineSpacing: (spacing: LineSpacing) => void;
  letterSpacing: LetterSpacing;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  readingRulerEnabled: boolean;
  setReadingRulerEnabled: (enabled: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speak: (text: string, onWord?: (wordIndex: number) => void, onEnd?: () => void) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(
    (localStorage.getItem('lexicare_font') as FontFamily) || 'lexend'
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(
    (localStorage.getItem('lexicare_size') as FontSize) || 'large'
  );
  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>(
    (localStorage.getItem('lexicare_spacing') as LineSpacing) || 'relaxed'
  );
  const [letterSpacing, setLetterSpacingState] = useState<LetterSpacing>(
    (localStorage.getItem('lexicare_letter_spacing') as LetterSpacing) || 'wide'
  );
  const [highContrast, setHighContrastState] = useState<boolean>(
    localStorage.getItem('lexicare_high_contrast') === 'true'
  );
  const [readingRulerEnabled, setReadingRulerEnabledState] = useState<boolean>(
    localStorage.getItem('lexicare_ruler') === 'true'
  );
  const [speechRate, setSpeechRateState] = useState<number>(
    parseFloat(localStorage.getItem('lexicare_speech_rate') || '0.9')
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const setFontFamily = (f: FontFamily) => {
    setFontFamilyState(f);
    localStorage.setItem('lexicare_font', f);
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem('lexicare_size', s);
  };

  const setLineSpacing = (ls: LineSpacing) => {
    setLineSpacingState(ls);
    localStorage.setItem('lexicare_spacing', ls);
  };

  const setLetterSpacing = (ls: LetterSpacing) => {
    setLetterSpacingState(ls);
    localStorage.setItem('lexicare_letter_spacing', ls);
  };

  const setHighContrast = (hc: boolean) => {
    setHighContrastState(hc);
    localStorage.setItem('lexicare_high_contrast', hc.toString());
  };

  const setReadingRulerEnabled = (rr: boolean) => {
    setReadingRulerEnabledState(rr);
    localStorage.setItem('lexicare_ruler', rr.toString());
  };

  const setSpeechRate = (r: number) => {
    setSpeechRateState(r);
    localStorage.setItem('lexicare_speech_rate', r.toString());
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string, onWord?: (wordIndex: number) => void, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    let wordCount = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        if (onWord) onWord(wordCount++);
      }
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
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
        isSpeaking,
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-200 ${
          fontFamily === 'dyslexic'
            ? 'font-dyslexic'
            : fontFamily === 'comic'
            ? 'font-comic'
            : 'font-lexend'
        } ${highContrast ? 'theme-high-contrast' : ''}`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
