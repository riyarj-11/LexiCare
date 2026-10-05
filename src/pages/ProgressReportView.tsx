import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProgressReport } from '../types';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import jsPDF from 'jspdf';
import {
  FileText,
  Download,
  Calendar,
  User,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Printer,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';

interface Props {
  initialStudentId?: number;
}

export const ProgressReportView: React.FC<Props> = ({ initialStudentId }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [activeReport, setActiveReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const studentId = initialStudentId || user?.studentId || 1;

  useEffect(() => {
    loadReports();
  }, [studentId]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsForStudent(studentId);
      setReports(data);
      if (data.length > 0) {
        setActiveReport(data[0]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewReport = async () => {
    setIsGenerating(true);
    try {
      const generated = await api.generateReport(studentId, user?.id);
      setReports([generated, ...reports]);
      setActiveReport(generated);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeReport) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header styling
    doc.setFillColor(13, 148, 136); // Teal 600
    doc.rect(0, 0, 210, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('LexiCare Educational Progress Observation Report', 15, 16);

    // Disclaimer alert box in PDF
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(15, 30, 180, 20, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14); // Amber 800
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT EDUCATIONAL NOTICE:', 20, 36);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This report provides educational observations and does not constitute a medical diagnosis.\nLexiCare is designed to identify learning patterns and guide targeted practice.',
      20,
      42
    );

    // Student Info
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Student Information', 15, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${activeReport.studentName}`, 20, 66);
    doc.text(`Grade Level: Grade ${activeReport.gradeLevel}   |   Age: ${activeReport.age}`, 20, 72);
    doc.text(`Report Date: ${new Date(activeReport.reportDate).toLocaleDateString()}`, 20, 78);
    doc.text(
      `Observation Period: ${new Date(activeReport.periodStart).toLocaleDateString()} to ${new Date(activeReport.periodEnd).toLocaleDateString()}`,
      20,
      84
    );

    // Summary of Observations
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Summary of Educational Observations', 15, 96);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(activeReport.overallSummary, 175);
    doc.text(summaryLines, 20, 104);

    // Skill Breakdown
    let yPos = 104 + summaryLines.length * 6 + 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Skill-Wise Performance Analysis', 15, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    Object.entries(activeReport.skillBreakdown).forEach(([skill, score]) => {
      doc.text(`${skill}:`, 25, yPos);
      doc.text(`${Math.round(score)}%`, 80, yPos);

      // Draw mini progress bar
      doc.setFillColor(226, 232, 240);
      doc.rect(95, yPos - 3, 70, 4, 'F');
      doc.setFillColor(13, 148, 136);
      doc.rect(95, yPos - 3, Math.min(70, (score / 100) * 70), 4, 'F');

      yPos += 7;
    });

    // Identified Difficulty Patterns
    yPos += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Identified Difficulty Patterns for Practice', 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const errorLines = doc.splitTextToSize(activeReport.commonErrorsSummary, 175);
    doc.text(errorLines, 20, yPos);

    // Recommended Action Plan
    yPos += errorLines.length * 6 + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Recommended Action Plan & Home Strategies', 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const planLines = doc.splitTextToSize(activeReport.recommendedActionPlan, 175);
    doc.text(planLines, 20, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Generated by LexiCare Educational Platform • For educational instruction & parent collaboration only.',
      15,
      285
    );

    doc.save(`LexiCare_Progress_Report_${activeReport.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-teal-800">Preparing progress reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Official Educational Progress Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Progress & Diagnostic Observation Report
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Structured observations, skill breakdowns, and multi-sensory action plans for educators and parents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Analyzing...' : 'Generate New Report'}
          </button>

          {activeReport && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export as PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Safety Notice Banner */}
      <EducationalDisclaimer variant="report" />

      {activeReport ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          {/* Student Profile Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xl">
                {activeReport.studentName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{activeReport.studentName}</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Grade {activeReport.gradeLevel} • Age {activeReport.age} Years • Oakridge Elementary
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1">
              <p>
                <strong>Report Date:</strong> {new Date(activeReport.reportDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Evaluation Period:</strong> 30 Days Cumulative
              </p>
            </div>
          </div>

          {/* Overall Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              1. Executive Educational Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {activeReport.overallSummary}
            </p>
          </div>

          {/* Skill Performance Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              2. Skill-Wise Performance Metrics
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(activeReport.skillBreakdown).map(([skill, score]) => (
                <div key={skill} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{skill}</span>
                    <span className="text-teal-800 font-black">{Math.round(score)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Error Patterns Identified */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              3. Identified Developmental Difficulty Patterns
            </h3>
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium whitespace-pre-line leading-relaxed">
              {activeReport.commonErrorsSummary}
            </div>
          </div>

          {/* Recommended Action Plan */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              4. Evidence-Based Instructional Action Plan
            </h3>
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs sm:text-sm text-teal-950 font-medium whitespace-pre-line leading-relaxed">
              {activeReport.recommendedActionPlan}
            </div>
          </div>

          {/* Formal Print & Export Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>LexiCare Educational Observation Platform • Model ID: LC-EDU-2026</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">No progress report generated yet for this student.</p>
          <button
            onClick={handleGenerateNewReport}
            className="px-6 py-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
          >
            Generate Initial Report Now
          </button>
        </div>
      )}
    </div>
  );
};
