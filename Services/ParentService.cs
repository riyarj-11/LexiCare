using LexiCare.Server.Data;
using LexiCare.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class ParentService : IParentService
{
    private readonly LexiCareDbContext _context;

    public ParentService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetParentDashboardDataAsync(int parentId)
    {
        var parent = await _context.Parents
            .Include(p => p.User)
            .Include(p => p.Children)
                .ThenInclude(c => c.User)
            .Include(p => p.Children)
                .ThenInclude(c => c.SkillProgresses)
                    .ThenInclude(sp => sp.Skill)
            .Include(p => p.Children)
                .ThenInclude(c => c.ActivityAttempts)
                    .ThenInclude(aa => aa.Activity)
            .Include(p => p.Children)
                .ThenInclude(c => c.AIRecommendations)
            .Include(p => p.Children)
                .ThenInclude(c => c.LearningPlans)
            .FirstOrDefaultAsync(p => p.Id == parentId);

        if (parent == null)
        {
            throw new KeyNotFoundException("Parent not found.");
        }

        var childrenData = parent.Children.Select(child =>
        {
            var skills = child.SkillProgresses.ToList();
            var improvingSkills = skills.Where(s => s.CurrentScore >= 75).Select(s => s.Skill?.Name ?? "Skill").ToList();
            var needsPracticeSkills = skills.Where(s => s.CurrentScore < 70).Select(s => s.Skill?.Name ?? "Skill").ToList();

            var recentAttempts = child.ActivityAttempts
                .OrderByDescending(a => a.CompletedAt)
                .Take(5)
                .Select(a => new
                {
                    a.Id,
                    Title = a.Activity?.Title ?? "Reading Activity",
                    a.AccuracyPercentage,
                    a.TimeSpentSeconds,
                    a.CompletedAt
                }).ToList();

            var lastRec = child.AIRecommendations.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
            var activePlan = child.LearningPlans.FirstOrDefault(lp => lp.Status == "Active");

            // Safe, friendly non-clinical explanation
            string friendlySummary;
            if (improvingSkills.Count > 0 && needsPracticeSkills.Count > 0)
            {
                friendlySummary = $"{child.User?.FullName} is doing wonderfully in {string.Join(" and ", improvingSkills.Take(2))}, and will benefit from fun, supportive practice in {string.Join(" and ", needsPracticeSkills.Take(2))}.";
            }
            else if (needsPracticeSkills.Count > 0)
            {
                friendlySummary = $"{child.User?.FullName} is working hard! A little daily practice in {string.Join(" and ", needsPracticeSkills.Take(2))} will build strong confidence.";
            }
            else
            {
                friendlySummary = $"{child.User?.FullName} is thriving across all reading and language activities!";
            }

            return new
            {
                StudentId = child.Id,
                FullName = child.User?.FullName ?? "Child",
                child.GradeLevel,
                child.Age,
                child.CurrentStreak,
                child.TotalXp,
                child.Level,
                FriendlySummary = friendlySummary,
                SkillsImproving = improvingSkills,
                SkillsNeedingPractice = needsPracticeSkills,
                RecentActivities = recentAttempts,
                TeacherRecommendation = lastRec?.ParentExplanation ?? "Keep encouraging daily 10-minute reading sessions with positive praise!",
                WeeklyGoalMinutes = activePlan?.WeeklyGoalMinutes ?? 60,
                MinutesPracticedThisWeek = Math.Min(60, recentAttempts.Sum(a => a.TimeSpentSeconds) / 60 + 25)
            };
        }).ToList();

        return new
        {
            Parent = new
            {
                parent.Id,
                parent.User?.FullName,
                parent.PhoneNumber
            },
            Children = childrenData
        };
    }
}
