using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class TeacherService : ITeacherService
{
    private readonly LexiCareDbContext _context;

    public TeacherService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetTeacherDashboardDataAsync(int teacherId)
    {
        var teacher = await _context.Teachers
            .Include(t => t.User)
            .Include(t => t.Classes)
                .ThenInclude(c => c.ClassStudents)
                    .ThenInclude(cs => cs.Student)
                        .ThenInclude(s => s!.User)
            .Include(t => t.Classes)
                .ThenInclude(c => c.ClassStudents)
                    .ThenInclude(cs => cs.Student)
                        .ThenInclude(s => s!.SkillProgresses)
                            .ThenInclude(sp => sp.Skill)
            .Include(t => t.Classes)
                .ThenInclude(c => c.ClassStudents)
                    .ThenInclude(cs => cs.Student)
                        .ThenInclude(s => s!.ScreeningSessions)
            .Include(t => t.AssignedWork)
                .ThenInclude(a => a.Activity)
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        if (teacher == null)
        {
            throw new KeyNotFoundException("Teacher profile not found.");
        }

        var allStudents = teacher.Classes
            .SelectMany(c => c.ClassStudents.Select(cs => cs.Student))
            .Where(s => s != null)
            .DistinctBy(s => s!.Id)
            .Select(s =>
            {
                var skills = s!.SkillProgresses.ToDictionary(sp => sp.Skill?.Name ?? "Skill", sp => sp.CurrentScore);
                var phonicsScore = skills.GetValueOrDefault("Phonics", 70);
                var readingScore = skills.GetValueOrDefault("Reading", 70);
                var spellingScore = skills.GetValueOrDefault("Spelling", 70);
                var compScore = skills.GetValueOrDefault("Comprehension", 70);

                var lowestSkills = skills.OrderBy(kv => kv.Value).Take(2).Select(kv => kv.Key).ToList();
                var recommendedFocus = string.Join(" + ", lowestSkills);

                var lastScreening = s.ScreeningSessions.OrderByDescending(ss => ss.CreatedAt).FirstOrDefault();

                return new
                {
                    StudentId = s.Id,
                    FullName = s.User?.FullName ?? "Student",
                    Email = s.User?.Email ?? "",
                    GradeLevel = s.GradeLevel,
                    Age = s.Age,
                    TotalXp = s.TotalXp,
                    CurrentStreak = s.CurrentStreak,
                    Level = s.Level,
                    Skills = skills,
                    ReadingScore = readingScore,
                    PhonicsScore = phonicsScore,
                    SpellingScore = spellingScore,
                    ComprehensionScore = compScore,
                    RecommendedFocus = recommendedFocus,
                    NeedsAttention = phonicsScore < 65 || spellingScore < 65 || readingScore < 65,
                    LastScreeningDate = lastScreening?.CompletedTime,
                    LastScreeningSummary = lastScreening?.DifficultySummary ?? "No screening yet"
                };
            })
            .ToList();

        var classes = teacher.Classes.Select(c => new
        {
            c.Id,
            c.Name,
            c.GradeLevel,
            c.AcademicYear,
            c.Description,
            StudentCount = c.ClassStudents.Count
        }).ToList();

        var assignments = teacher.AssignedWork.Select(a => new
        {
            a.Id,
            a.Title,
            ActivityTitle = a.Activity?.Title ?? "Activity",
            a.Instructions,
            a.DueDate,
            a.IsCompleted,
            a.CompletedAt,
            a.Score
        }).OrderByDescending(a => a.DueDate).ToList();

        return new
        {
            Teacher = new
            {
                teacher.Id,
                teacher.User?.FullName,
                teacher.SchoolName,
                teacher.Subject
            },
            Classes = classes,
            Students = allStudents,
            Assignments = assignments,
            TotalStudents = allStudents.Count,
            StudentsNeedingAttention = allStudents.Count(s => s.NeedsAttention)
        };
    }

    public async Task<Class> CreateClassAsync(int teacherId, string name, int gradeLevel, string description)
    {
        var newClass = new Class
        {
            TeacherId = teacherId,
            Name = name,
            GradeLevel = gradeLevel,
            Description = description,
            AcademicYear = "2026-2027",
            CreatedAt = DateTime.UtcNow
        };
        await _context.Classes.AddAsync(newClass);
        await _context.SaveChangesAsync();
        return newClass;
    }

    public async Task<bool> EnrollStudentAsync(int classId, int studentId)
    {
        var exists = await _context.ClassStudents.AnyAsync(cs => cs.ClassId == classId && cs.StudentId == studentId);
        if (exists) return true;

        await _context.ClassStudents.AddAsync(new ClassStudent
        {
            ClassId = classId,
            StudentId = studentId,
            EnrolledAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Assignment> CreateAssignmentAsync(CreateAssignmentDto dto)
    {
        var assignment = new Assignment
        {
            TeacherId = dto.TeacherId,
            ClassId = dto.ClassId,
            StudentId = dto.StudentId,
            ActivityId = dto.ActivityId,
            Title = dto.Title,
            Instructions = dto.Instructions,
            DueDate = dto.DueDate,
            IsCompleted = false
        };

        await _context.Assignments.AddAsync(assignment);
        await _context.SaveChangesAsync();
        return assignment;
    }

    public async Task<LearningPlan> CreatePlanAsync(int teacherUserId, CreatePlanDto dto)
    {
        var plan = new LearningPlan
        {
            StudentId = dto.StudentId,
            CreatedByUserId = teacherUserId,
            Title = dto.Title,
            Description = dto.Description,
            RecommendedFocusSkills = dto.RecommendedFocusSkills,
            WeeklyGoalMinutes = dto.WeeklyGoalMinutes,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.LearningPlans.AddAsync(plan);
        await _context.SaveChangesAsync();
        return plan;
    }
}
