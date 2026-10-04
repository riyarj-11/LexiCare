import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import {
  BookOpen,
  LayoutDashboard,
  BrainCircuit,
  Gamepad2,
  Glasses,
  TrendingUp,
  FileText,
  Bot,
  UserCheck,
  ChevronDown,
  LogOut,
  Flame,
  Zap,
  Menu,
  X
} from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const { user, role, loginDemo, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'screening', label: 'Screening', icon: BrainCircuit },
    { id: 'learning', label: 'Learning', icon: Gamepad2 },
    { id: 'reading', label: 'Reading Assistant', icon: Glasses },
    { id: 'progress', label: 'Progress Map', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  ];

  const handleRoleSwitch = (newRole: 'Student' | 'Teacher' | 'Parent' | 'Admin') => {
    loginDemo(newRole);
    setRoleMenuOpen(false);
    onSelectTab('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Lexi<span className="text-teal-600">Care</span>
                </span>
                <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  AI Support
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block -mt-1">
                Empowering Readers & Families
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Accessibility & Demo Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Gamification Streak & XP Badge for Student */}
            {role === 'Student' && (
              <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1" title="Current Daily Streak">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  5d
                </span>
                <span className="text-amber-300">|</span>
                <span className="flex items-center gap-1 text-teal-800" title="Total XP">
                  <Zap className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
                  480 XP
                </span>
              </div>
            )}

            {/* Accessibility Quick Panel */}
            <AccessibilityToolbar />

            {/* 1-Click Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-bold text-slate-800 transition-colors"
                title="Switch Demo Role for instant recruiter exploration"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-teal-700">{role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                  <p className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    Explore As (1-Click Switch)
                  </p>
                  <button
                    onClick={() => handleRoleSwitch('Student')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      role === 'Student' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Student: Aarav</p>
                      <p className="text-[11px] text-slate-500">Grade 3, Phonics/Spelling Focus</p>
                    </div>
                    {role === 'Student' && <span className="text-teal-600 text-xs">✓</span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('Teacher')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      role === 'Teacher' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Teacher: Sarah Jenkins</p>
                      <p className="text-[11px] text-slate-500">Class Analytics & Assignments</p>
                    </div>
                    {role === 'Teacher' && <span className="text-teal-600 text-xs">✓</span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('Parent')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      role === 'Parent' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Parent: Priya Sharma</p>
                      <p className="text-[11px] text-slate-500">Clear, Loving Progress Insights</p>
                    </div>
                    {role === 'Parent' && <span className="text-teal-600 text-xs">✓</span>}
                  </button>

                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left ${
                    active ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
