import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  School,
  Users,
  AlertTriangle,
  PlusCircle,
  FileText,
  Calendar,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extra?: any) => void;
}

export const TeacherDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createClassModal, setCreateClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState(3);
  const [classDesc, setClassDesc] = useState('');

  const [assignModal, setAssignModal] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<number | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignActivityId, setAssignActivityId] = useState<number>(1);
  const [assignDueDate, setAssignDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  const [planModal, setPlanModal] = useState(false);
  const [planStudentId, setPlanStudentId] = useState<number>(1);
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planFocusSkills, setPlanFocusSkills] = useState('Phonics, Spelling');
  const [planGoalMins, setPlanGoalMins] = useState(60);

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const teacherId = user?.teacherId || 1;
      const data = await api.getTeacherDashboard(teacherId);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    try {
      const teacherId = user?.teacherId || 1;
      await api.createClass(teacherId, className, classGrade, classDesc);
      setCreateClassModal(false);
      setClassName('');
      setClassDesc('');
      await loadTeacherData();
    } catch (err) {
      console.error('Failed to create class:', err);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim()) return;
    try {
      const teacherId = user?.teacherId || 1;
      await api.createAssignment({
        teacherId,
        studentId: selectedStudentForAssign || undefined,
        activityId: assignActivityId,
        title: assignTitle,
        instructions: assignInstructions,
        dueDate: assignDueDate,
      });
      setAssignModal(false);
      setAssignTitle('');
      setAssignInstructions('');
      await loadTeacherData();
    } catch (err) {
      console.error('Failed to create assignment:', err);
    }
  };

  const handleCreatePlan = async () => {
    if (!planTitle.trim()) return;
    try {
      const teacherUserId = user?.id || 1;
      await api.createPlan(teacherUserId, {
        studentId: planStudentId,
        title: planTitle,
        description: planDesc,
        recommendedFocusSkills: planFocusSkills,
        weeklyGoalMinutes: planGoalMins,
      });
      setPlanModal(false);
      setPlanTitle('');
      setPlanDesc('');
      await loadTeacherData();
    } catch (err) {
      console.error('Failed to create plan:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-teal-800">Loading classroom data...</p>
        </div>
      </div>
    );
  }

  const teacher = dashboardData?.teacher || {};
  const students = dashboardData?.students || [];
  const classes = dashboardData?.classes || [];
  const assignments = dashboardData?.assignments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Welcome Header */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <School className="w-3.5 h-3.5 text-teal-400" />
            <span>{teacher.schoolName || 'Oakridge Elementary School'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Educator Command Center: {teacher.fullName || 'Sarah Jenkins, M.Ed.'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Monitor reading profiles, spot phonological difficulties early, and deploy structured multi-sensory assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreateClassModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-teal-300" />
            <span>New Class</span>
          </button>

          <button
            onClick={() => setAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assign Exercise</span>
          </button>
        </div>
      </div>

      {/* Classroom Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Students</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{students.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Across {classes.length} active classes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold">Needs Support Focus</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-extrabold text-amber-600">
            {students.filter((s: any) => s.needsAttention).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Phonics & visual discrimination</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Active Assignments</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-3xl font-extrabold text-purple-700">{assignments.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {assignments.filter((a: any) => !a.isCompleted).length} pending completion
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Class Average</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">76.4%</span>
          <span className="text-[11px] text-slate-500 block mt-1">Steady upward reading trend</span>
        </div>
      </div>

      {/* STUDENT SKILL PROFILES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Student Skill Matrix & Difficulty Monitoring
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies individual decoding strengths and areas benefiting from targeted multi-sensory instruction.
            </p>
          </div>

          <button
            onClick={() => setPlanModal(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <BrainCircuit className="w-4 h-4 text-teal-600" />
            <span>Create Individual Plan</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Reading</th>
                <th className="py-3 px-4">Phonics</th>
                <th className="py-3 px-4">Spelling</th>
                <th className="py-3 px-4">Comprehension</th>
                <th className="py-3 px-4">Recommended Focus</th>
                <th className="py-3 px-4">Screening Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student: any) => (
                <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          Grade {student.gradeLevel} • Age {student.age}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Reading */}
                  <td className="py-4 px-4 font-semibold">
                    <span className={student.readingScore < 70 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                      {Math.round(student.readingScore)}%
                    </span>
                  </td>

                  {/* Phonics */}
                  <td className="py-4 px-4 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.phonicsScore < 65
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {Math.round(student.phonicsScore)}%
                    </span>
                  </td>

                  {/* Spelling */}
                  <td className="py-4 px-4 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.spellingScore < 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {Math.round(student.spellingScore)}%
                    </span>
                  </td>

                  {/* Comprehension */}
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    <span className="font-bold text-teal-800">{Math.round(student.comprehensionScore)}%</span>
                  </td>

                  {/* Recommended Focus */}
                  <td className="py-4 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-bold">
                      {student.recommendedFocus}
                    </span>
                  </td>

                  {/* Screening Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`text-[11px] font-medium leading-tight block ${
                        student.needsAttention ? 'text-amber-700' : 'text-slate-600'
                      }`}
                    >
                      {student.lastScreeningSummary}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudentForAssign(student.studentId);
                          setAssignModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => onNavigate('reports', { studentId: student.studentId })}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs"
                      >
                        Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Create Class Modal */}
      {createClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Create New Class</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Grade 3 - Phonics Explorers"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grade Level</label>
                <input
                  type="number"
                  value={classGrade}
                  onChange={(e) => setClassGrade(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  placeholder="Focus areas and goals..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCreateClassModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                disabled={!className.trim()}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assign Exercise Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Assign Learning Exercise</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student</label>
                <select
                  value={selectedStudentForAssign || ''}
                  onChange={(e) => setSelectedStudentForAssign(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                >
                  <option value="">All Students in Class</option>
                  {students.map((s: any) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.recommendedFocus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity</label>
                <select
                  value={assignActivityId}
                  onChange={(e) => setAssignActivityId(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                >
                  <option value={1}>B vs D Detective (Word Recognition)</option>
                  <option value={2}>Sound to Letter Builder (Phonics)</option>
                  <option value={3}>Spelling Power: C vs K (Spelling)</option>
                  <option value={4}>Sentence Flow & Fluency (Reading)</option>
                  <option value={5}>The Secret Treehouse (Comprehension)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="e.g. Weekly Phonics Practice"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions for Student</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="Complete 5 rounds before Friday..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                disabled={!assignTitle.trim()}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Assign Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Learning Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Create Targeted Growth Plan</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student</label>
                <select
                  value={planStudentId}
                  onChange={(e) => setPlanStudentId(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                >
                  {students.map((s: any) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Title</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. 4-Week Phonics & Spelling Acceleration"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Focus Skills</label>
                <input
                  type="text"
                  value={planFocusSkills}
                  onChange={(e) => setPlanFocusSkills(e.target.value)}
                  placeholder="e.g. Phonics, Word Recognition"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Weekly Goal (Minutes)</label>
                <input
                  type="number"
                  value={planGoalMins}
                  onChange={(e) => setPlanGoalMins(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructional Strategy & Notes</label>
                <textarea
                  rows={3}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Utilize multi-sensory letter cards, sand tracing, and paired reading sessions..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPlanModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!planTitle.trim()}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Activate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
