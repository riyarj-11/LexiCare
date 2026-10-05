import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { EducationalDisclaimer } from './components/EducationalDisclaimer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { ScreeningFlow } from './pages/ScreeningFlow';
import { AdaptiveLearningView } from './pages/AdaptiveLearningView';
import { ReadingAssistant } from './pages/ReadingAssistant';
import { ProgressMapView } from './pages/ProgressMapView';
import { ProgressReportView } from './pages/ProgressReportView';
import { AIAssistantView } from './pages/AIAssistantView';

const MainAppContent: React.FC = () => {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [navExtra, setNavExtra] = useState<any>(null);

  const handleNavigate = (tab: string, extra?: any) => {
    setCurrentTab(tab);
    setNavExtra(extra || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboard = () => {
    if (role === 'Teacher') {
      return <TeacherDashboard onNavigate={handleNavigate} />;
    }
    if (role === 'Parent') {
      return <ParentDashboard onNavigate={handleNavigate} />;
    }
    return <StudentDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Educational Disclaimer Banner */}
      <EducationalDisclaimer variant="banner" />

      {/* Main Accessible Header */}
      <Navbar currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentTab === 'dashboard' && renderDashboard()}
        {currentTab === 'screening' && <ScreeningFlow onNavigate={handleNavigate} />}
        {currentTab === 'learning' && (
          <AdaptiveLearningView
            initialActivityId={navExtra?.activityId}
            initialSkillFilter={navExtra?.skillFilter}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'reading' && <ReadingAssistant />}
        {currentTab === 'progress' && <ProgressMapView onNavigate={handleNavigate} />}
        {currentTab === 'reports' && (
          <ProgressReportView initialStudentId={navExtra?.studentId} />
        )}
        {currentTab === 'ai-assistant' && <AIAssistantView onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-800">
            LexiCare AI — Educational Dyslexia Support System
          </p>
          <p>
            Designed for students, parents, and educators. This system is for educational support only and does not constitute a medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <MainAppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
