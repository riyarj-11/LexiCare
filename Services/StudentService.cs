using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class StudentService : IStudentService
{
    private readonly LexiCareDbContext _context;

    public StudentService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<StudentDto?> GetStudentByIdAsync(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.SkillProgresses)
                .ThenInclude(sp => sp.Skill)
            .Include(s => s.StudentAchievements)
                .ThenInclude(sa => sa.Achievement)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        return student == null ? null : MapToDto(student);
    }

    public async Task<StudentDto?> GetStudentByUserIdAsync(int userId)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.SkillProgresses)
                .ThenInclude(sp => sp.Skill)
            .Include(s => s.StudentAchievements)
                .ThenInclude(sa => sa.Achievement)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        return student == null ? null : MapToDto(student);
    }

    public async Task<StudentDto> UpdateSettingsAsync(int studentId, UpdateStudentSettingsDto settings)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.SkillProgresses)
                .ThenInclude(sp => sp.Skill)
            .Include(s => s.StudentAchievements)
                .ThenInclude(sa => sa.Achievement)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
        {
            throw new KeyNotFoundException("Student not found.");
        }

        if (settings.PreferredTheme != null)
        {
            student.PreferredTheme = settings.PreferredTheme;
        }
        if (settings.DyslexiaFontEnabled.HasValue)
        {
            student.DyslexiaFontEnabled = settings.DyslexiaFontEnabled.Value;
        }
        if (settings.TextSize != null)
        {
            student.TextSize = settings.TextSize;
        }

        await _context.SaveChangesAsync();
        return MapToDto(student);
    }

    public async Task<List<StudentSkillProgressDto>> GetSkillProgressAsync(int studentId)
    {
        var progresses = await _context.StudentSkillProgresses
            .Include(sp => sp.Skill)
            .Where(sp => sp.StudentId == studentId)
            .OrderBy(sp => sp.Skill!.OrderIndex)
            .ToListAsync();

        return progresses.Select(sp => new StudentSkillProgressDto
        {
            SkillId = sp.SkillId,
            SkillName = sp.Skill?.Name ?? "Skill",
            Category = sp.Skill?.Category ?? "General",
            CurrentScore = sp.CurrentScore,
            Level = sp.Level,
            AccuracyRate = sp.AccuracyRate,
            TotalAttempts = sp.TotalAttempts,
            LastPracticedAt = sp.LastPracticedAt,
            CommonErrorPatterns = ParseJsonList(sp.CommonErrorPatterns)
        }).ToList();
    }

    public async Task<List<AchievementDto>> GetStudentAchievementsAsync(int studentId)
    {
        var allAchievements = await _context.Achievements.ToListAsync();
        var earned = await _context.StudentAchievements
            .Where(sa => sa.StudentId == studentId)
            .ToDictionaryAsync(sa => sa.AchievementId, sa => sa.EarnedAt);

        return allAchievements.Select(a => new AchievementDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            Icon = a.Icon,
            BadgeType = a.BadgeType,
            XpBonus = a.XpBonus,
            EarnedAt = earned.TryGetValue(a.Id, out var date) ? date : null
        }).ToList();
    }

    private static StudentDto MapToDto(Student student)
    {
        return new StudentDto
        {
            Id = student.Id,
            UserId = student.UserId,
            FullName = student.User?.FullName ?? "Student",
            Email = student.User?.Email ?? string.Empty,
            GradeLevel = student.GradeLevel,
            Age = student.Age,
            PreferredTheme = student.PreferredTheme,
            DyslexiaFontEnabled = student.DyslexiaFontEnabled,
            TextSize = student.TextSize,
            CurrentStreak = student.CurrentStreak,
            TotalXp = student.TotalXp,
            Level = student.Level,
            Skills = student.SkillProgresses.Select(sp => new StudentSkillProgressDto
            {
                SkillId = sp.SkillId,
                SkillName = sp.Skill?.Name ?? "Skill",
                Category = sp.Skill?.Category ?? "General",
                CurrentScore = sp.CurrentScore,
                Level = sp.Level,
                AccuracyRate = sp.AccuracyRate,
                TotalAttempts = sp.TotalAttempts,
                LastPracticedAt = sp.LastPracticedAt,
                CommonErrorPatterns = ParseJsonList(sp.CommonErrorPatterns)
            }).ToList(),
            Achievements = student.StudentAchievements.Select(sa => new AchievementDto
            {
                Id = sa.AchievementId,
                Title = sa.Achievement?.Title ?? "Achievement",
                Description = sa.Achievement?.Description ?? string.Empty,
                Icon = sa.Achievement?.Icon ?? "Award",
                BadgeType = sa.Achievement?.BadgeType ?? "General",
                XpBonus = sa.Achievement?.XpBonus ?? 50,
                EarnedAt = sa.EarnedAt
            }).ToList()
        };
    }

    private static List<string> ParseJsonList(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
