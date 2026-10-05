import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

interface Props {
  variant?: 'banner' | 'card' | 'report';
  className?: string;
}

export const EducationalDisclaimer: React.FC<Props> = ({ variant = 'banner', className = '' }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && variant === 'banner') return null;

  if (variant === 'report') {
    return (
      <div className={`p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-900 ${className}`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-950 uppercase tracking-wider text-xs mb-1">
              Important Educational & Safety Notice
            </p>
            <p className="font-medium leading-relaxed">
              This report provides educational observations and does not constitute a medical diagnosis. 
              LexiCare is designed to identify learning patterns, recommend structured practice activities, and monitor instructional growth. 
              For clinical assessment, consult a qualified educational psychologist or healthcare specialist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 bg-teal-50/80 border border-teal-200 rounded-2xl text-teal-900 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <span className="font-semibold text-teal-950">Educational Support System: </span>
            This screening is for educational support only and is not a medical diagnosis. It identifies specific phonetic, reading, and spelling patterns to personalize your learning journey.
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Educational Disclaimer" className={`bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-teal-500/10 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-950 transition-all ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
            Educational Notice
          </span>
          <p className="font-medium text-amber-900">
            This screening is for educational support only and is not a medical diagnosis.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-800 hover:text-amber-950 p-1 rounded hover:bg-amber-100 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss educational disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
