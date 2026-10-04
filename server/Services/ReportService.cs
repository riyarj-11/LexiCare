using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class ReportService : IReportService
{
    private readonly LexiCareDbContext _context;

    public ReportService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<ProgressReportDto> GenerateReportAsync(int studentId, int? generatedByUserId = null)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.SkillProgresses)
                .ThenInclude(sp => sp.Skill)
            .Include(s => s.ScreeningSessions)
                .ThenInclude(ss => ss.Responses)
            .Include(s => s.ActivityAttempts)
                .ThenInclude(aa => aa.Activity)
            .Include(s => s.AIRecommendations)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
        {
            throw new KeyNotFoundException("Student not found.");
        }

        var skillDict = student.SkillProgresses
            .ToDictionary(sp => sp.Skill?.Name ?? "Skill", sp => sp.CurrentScore);

        var lastSession = student.ScreeningSessions.OrderByDescending(s => s.CreatedAt).FirstOrDefault();
        var errorPatterns = lastSession?.Responses
            .Where(r => !r.IsCorrect && !string.IsNullOrEmpty(r.ErrorPatternDetected))
            .Select(r => r.ErrorPatternDetected)
            .Distinct()
            .ToList() ?? new List<string>();

        var errorSummary = errorPatterns.Count > 0
            ? string.Join("; ", errorPatterns.Select(FormatErrorPatternName))
            : "No repetitive error patterns identified. Steady decoding across standard tasks.";

        var lowestSkills = skillDict.OrderBy(kv => kv.Value).Take(2).Select(kv => kv.Key).ToList();
        var highestSkills = skillDict.OrderByDescending(kv => kv.Value).Take(2).Select(kv => kv.Key).ToList();

        var summary = $"{student.User?.FullName} demonstrates outstanding strengths in {string.Join(" and ", highestSkills)}. " +
                      $"Structured multi-sensory support is recommended in {string.Join(" and ", lowestSkills)} to strengthen decoding automaticity.";

        var actionPlan = $"1. Daily 5-minute multisensory tactile drills (letter tracing & Elkonin sound boxes).\n" +
                         $"2. Use LexiCare Reading Assistant with sentence focus guide and OpenDyslexic font.\n" +
                         $"3. Reinforce orthographic spelling patterns (e.g., C vs K generalizations).\n" +
                         $"4. Review growth bi-weekly and share progress with classroom educators.";

        var report = new ProgressReport
        {
            StudentId = student.Id,
            GeneratedByUserId = generatedByUserId,
            ReportDate = DateTime.UtcNow,
            PeriodStart = DateTime.UtcNow.AddDays(-30),
            PeriodEnd = DateTime.UtcNow,
            OverallSummary = summary,
            SkillBreakdownJson = JsonSerializer.Serialize(skillDict),
            CommonErrorsSummary = errorSummary,
            RecommendedActionPlan = actionPlan,
            DisclaimerText = "This report provides educational observations and does not constitute a medical diagnosis."
        };

        await _context.ProgressReports.AddAsync(report);
        await _context.SaveChangesAsync();

        return MapToDto(report, student);
    }

    public async Task<List<ProgressReportDto>> GetReportsForStudentAsync(int studentId)
    {
        var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null) return new();

        var list = await _context.ProgressReports
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.ReportDate)
            .ToListAsync();

        return list.Select(r => MapToDto(r, student)).ToList();
    }

    public async Task<ProgressReportDto?> GetReportByIdAsync(int reportId)
    {
        var report = await _context.ProgressReports
            .Include(r => r.Student)
                .ThenInclude(s => s!.User)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null || report.Student == null) return null;

        return MapToDto(report, report.Student);
    }

    private static ProgressReportDto MapToDto(ProgressReport report, Student student)
    {
        Dictionary<string, double> skills;
        try
        {
            skills = JsonSerializer.Deserialize<Dictionary<string, double>>(report.SkillBreakdownJson) ?? new();
        }
        catch
        {
            skills = new();
        }

        return new ProgressReportDto
        {
            Id = report.Id,
            StudentId = student.Id,
            StudentName = student.User?.FullName ?? "Student",
            Age = student.Age,
            GradeLevel = student.GradeLevel,
            ReportDate = report.ReportDate,
            PeriodStart = report.PeriodStart,
            PeriodEnd = report.PeriodEnd,
            OverallSummary = report.OverallSummary,
            SkillBreakdown = skills,
            CommonErrorsSummary = report.CommonErrorsSummary,
            RecommendedActionPlan = report.RecommendedActionPlan,
            DisclaimerText = report.DisclaimerText
        };
    }

    private static string FormatErrorPatternName(string tag)
    {
        return tag switch
        {
            "b_d_confusion" => "b/d visual orientation",
            "phonetic_substitution" => "phonetic spelling substitutions (e.g. kat/cat)",
            "silent_e_omission" => "silent-e vowel length rule",
            "consonant_doubling" => "consonant doubling after short vowels",
            "vowel_digraph_confusion" => "vowel digraphs (ai, ea, oa)",
            "phonemic_segmentation" => "sound segmentation in words",
            "rhyme_awareness" => "rhyme and phonological awareness",
            _ => tag.Replace("_", " ")
        };
    }
}
