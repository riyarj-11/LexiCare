import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AIChatMessage } from '../types';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Volume2
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const AIAssistantView: React.FC<Props> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user?.fullName || ''}! I am your LexiCare Educational AI Assistant.\n\nI provide evidence-based, compassionate educational strategies to support young readers at home and in the classroom. Feel free to ask about phonics exercises, letter confusion (like b/d), or weekly learning routines!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Why does my child confuse b and d?',
        'What activities can help improve phonics?',
        'Why do they spell cat as kat?',
        'What should we practice this week?'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const studentId = user?.studentId || 1;
      const res = await api.chatAI(textToSend, studentId, role);

      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
        recommendedActivities: res.recommendedActivities
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Bot className="w-4 h-4 text-teal-600" />
          LexiCare AI Pedagogical Advisor
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Educational Guidance for Parents & Teachers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Ask practical questions about reading development, multi-sensory techniques, and overcoming everyday literacy challenges.
        </p>
      </div>

      {/* Safety Notice */}
      <EducationalDisclaimer variant="card" />

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-xl space-y-3 ${isUser ? 'items-end text-right' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                      isUser
                        ? 'bg-teal-600 text-white font-medium rounded-tr-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommended Activities if present */}
                  {msg.recommendedActivities && msg.recommendedActivities.length > 0 && (
                    <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-xs space-y-1.5 text-left">
                      <span className="font-bold text-teal-950 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Recommended Practice Challenge:
                      </span>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {msg.recommendedActivities.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => onNavigate('learning')}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-2xs"
                          >
                            Play {act} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Prompts Pill Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 text-left">
                      {msg.suggestedActions.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs"
                        >
                          💬 "{prompt}"
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">{msg.timestamp}</span>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <p>Formulating educational guidance...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an educational question (e.g. 'How can I make phonics practice fun at home?')..."
              className="flex-1 p-3.5 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 outline-none focus:border-teal-600 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold transition-all shadow-sm"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
