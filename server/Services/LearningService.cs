using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class LearningService : ILearningService
{
    private readonly LexiCareDbContext _context;

    public LearningService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityDto>> GetActivitiesAsync(int? skillId = null, int? difficulty = null)
    {
        var query = _context.LearningActivities
            .Include(a => a.Skill)
            .AsQueryable();

        if (skillId.HasValue)
        {
            query = query.Where(a => a.SkillId == skillId.Value);
        }
        if (difficulty.HasValue)
        {
            query = query.Where(a => a.DifficultyLevel == difficulty.Value);
        }

        var activities = await query.ToListAsync();

        return activities.Select(a => new ActivityDto
        {
            Id = a.Id,
            SkillId = a.SkillId,
            SkillName = a.Skill?.Name ?? "General",
            Title = a.Title,
            Description = a.Description,
            Type = a.Type,
            DifficultyLevel = a.DifficultyLevel,
            ContentJson = a.ContentJson,
            EstimatedMinutes = a.EstimatedMinutes,
            XpReward = a.XpReward
        }).ToList();
    }

    public async Task<ActivityDto?> GetActivityByIdAsync(int id)
    {
        var a = await _context.LearningActivities
            .Include(x => x.Skill)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return null;

        return new ActivityDto
        {
            Id = a.Id,
            SkillId = a.SkillId,
            SkillName = a.Skill?.Name ?? "General",
            Title = a.Title,
            Description = a.Description,
            Type = a.Type,
            DifficultyLevel = a.DifficultyLevel,
            ContentJson = a.ContentJson,
            EstimatedMinutes = a.EstimatedMinutes,
            XpReward = a.XpReward
        };
    }

    public async Task<AdaptiveFeedbackDto> SubmitAttemptAsync(SubmitActivityAttemptDto attempt)
    {
        var student = await _context.Students
            .Include(s => s.SkillProgresses)
            .Include(s => s.StudentAchievements)
            .FirstOrDefaultAsync(s => s.Id == attempt.StudentId);

        var activity = await _context.LearningActivities
            .Include(a => a.Skill)
            .FirstOrDefaultAsync(a => a.Id == attempt.ActivityId);

        if (student == null || activity == null)
        {
            throw new KeyNotFoundException("Student or Activity not found.");
        }

        var accuracy = attempt.MaxScore > 0 ? (double)attempt.Score / attempt.MaxScore * 100.0 : 0.0;
        int nextDifficulty = activity.DifficultyLevel;
        string feedback;
        string guidance;

        // Adaptive engine logic:
        // >= 90% -> Increase difficulty
        // 70-89% -> Maintain difficulty
        // < 70%  -> Provide easier practice and additional guidance
        if (accuracy >= 90.0)
        {
            nextDifficulty = Math.Min(5, activity.DifficultyLevel + 1);
            feedback = "Outstanding mastery! You breezed through this challenge. We're leveling up the difficulty to keep your brain growing!";
            guidance = "Tip: Try reading longer words by splitting them into syllables first (e.g., 'un-der-stand').";
        }
        else if (accuracy >= 70.0)
        {
            nextDifficulty = activity.DifficultyLevel;
            feedback = "Great work! Solid performance. Keep practicing at this level to build automatic decoding habits.";
            guidance = "Tip: Take your time on letters with circles and stems. Remember: 'b' has a belly forward, 'd' has a diaper behind!";
        }
        else
        {
            nextDifficulty = Math.Max(1, activity.DifficultyLevel - 1);
            feedback = "Good effort! Practice makes permanent. We've dialed the challenge to a supportive level with extra visual cues.";
            guidance = "Tip: Try tracing the letter in the air or tapping each sound on your fingers before selecting the answer.";
        }

        // XP Calculation: base activity reward + score bonus
        var xpEarned = (int)(activity.XpReward * (accuracy / 100.0)) + 15;
        student.TotalXp += xpEarned;
        student.Level = 1 + (student.TotalXp / 250);

        // Streak calculation
        var today = DateTime.UtcNow.Date;
        if (!student.LastActiveDate.HasValue || student.LastActiveDate.Value.Date < today.AddDays(-1))
        {
            student.CurrentStreak = 1;
        }
        else if (student.LastActiveDate.Value.Date == today.AddDays(-1))
        {
            student.CurrentStreak += 1;
        }
        student.LastActiveDate = DateTime.UtcNow;

        // Record Attempt
        var record = new ActivityAttempt
        {
            StudentId = student.Id,
            ActivityId = activity.Id,
            Score = attempt.Score,
            MaxScore = attempt.MaxScore,
            AccuracyPercentage = Math.Round(accuracy, 1),
            TimeSpentSeconds = attempt.TimeSpentSeconds,
            CompletedAt = DateTime.UtcNow,
            DifficultyAdjustedTo = nextDifficulty,
            ErrorPatternsIdentified = JsonSerializer.Serialize(attempt.ErrorPatterns)
        };
        await _context.ActivityAttempts.AddAsync(record);

        // Update Student Skill Progress
        var skillProgress = student.SkillProgresses.FirstOrDefault(sp => sp.SkillId == activity.SkillId);
        if (skillProgress != null)
        {
            skillProgress.TotalAttempts += 1;
            skillProgress.LastPracticedAt = DateTime.UtcNow;
            skillProgress.CurrentScore = Math.Round((skillProgress.CurrentScore * 0.7) + (accuracy * 0.3), 1);
            skillProgress.AccuracyRate = Math.Round((skillProgress.AccuracyRate * 0.8) + (accuracy * 0.2), 1);

            if (skillProgress.CurrentScore >= 85) skillProgress.Level = "Mastered";
            else if (skillProgress.CurrentScore >= 70) skillProgress.Level = "Proficient";
            else if (skillProgress.CurrentScore >= 55) skillProgress.Level = "Developing";
            else skillProgress.Level = "Beginner";
        }

        // Check for Gamification Achievements Unlocked
        var newAchievements = new List<AchievementDto>();
        var earnedAchievementIds = student.StudentAchievements.Select(sa => sa.AchievementId).ToHashSet();
        var allAchievements = await _context.Achievements.ToListAsync();

        // 1. First Reading Session
        var firstSession = allAchievements.FirstOrDefault(a => a.BadgeType == "FirstSession");
        if (firstSession != null && !earnedAchievementIds.Contains(firstSession.Id))
        {
            var sa = new StudentAchievement { StudentId = student.Id, AchievementId = firstSession.Id, EarnedAt = DateTime.UtcNow };
            await _context.StudentAchievements.AddAsync(sa);
            student.TotalXp += firstSession.XpBonus;
            newAchievements.Add(new AchievementDto
            {
                Id = firstSession.Id,
                Title = firstSession.Title,
                Description = firstSession.Description,
                Icon = firstSession.Icon,
                BadgeType = firstSession.BadgeType,
                XpBonus = firstSession.XpBonus,
                EarnedAt = DateTime.UtcNow
            });
        }

        // 2. Phonics Explorer if completed 3+ phonics attempts
        var phonicsBadge = allAchievements.FirstOrDefault(a => a.BadgeType == "PhonicsExplorer");
        if (phonicsBadge != null && !earnedAchievementIds.Contains(phonicsBadge.Id))
        {
            var attemptsCount = await _context.ActivityAttempts.CountAsync(a => a.StudentId == student.Id);
            if (attemptsCount >= 2)
            {
                var sa = new StudentAchievement { StudentId = student.Id, AchievementId = phonicsBadge.Id, EarnedAt = DateTime.UtcNow };
                await _context.StudentAchievements.AddAsync(sa);
                student.TotalXp += phonicsBadge.XpBonus;
                newAchievements.Add(new AchievementDto
                {
                    Id = phonicsBadge.Id,
                    Title = phonicsBadge.Title,
                    Description = phonicsBadge.Description,
                    Icon = phonicsBadge.Icon,
                    BadgeType = phonicsBadge.BadgeType,
                    XpBonus = phonicsBadge.XpBonus,
                    EarnedAt = DateTime.UtcNow
                });
            }
        }

        // 3. 7-day streak
        var streakBadge = allAchievements.FirstOrDefault(a => a.BadgeType == "Streak7");
        if (streakBadge != null && !earnedAchievementIds.Contains(streakBadge.Id) && student.CurrentStreak >= 7)
        {
            var sa = new StudentAchievement { StudentId = student.Id, AchievementId = streakBadge.Id, EarnedAt = DateTime.UtcNow };
            await _context.StudentAchievements.AddAsync(sa);
            student.TotalXp += streakBadge.XpBonus;
            newAchievements.Add(new AchievementDto
            {
                Id = streakBadge.Id,
                Title = streakBadge.Title,
                Description = streakBadge.Description,
                Icon = streakBadge.Icon,
                BadgeType = streakBadge.BadgeType,
                XpBonus = streakBadge.XpBonus,
                EarnedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return new AdaptiveFeedbackDto
        {
            AccuracyPercentage = Math.Round(accuracy, 1),
            XpEarned = xpEarned,
            CurrentStreak = student.CurrentStreak,
            NewTotalXp = student.TotalXp,
            NewLevel = student.Level,
            NextRecommendedDifficulty = nextDifficulty,
            FeedbackMessage = feedback,
            GuidanceTip = guidance,
            NewlyEarnedAchievements = newAchievements
        };
    }

    public async Task<List<Assignment>> GetStudentAssignmentsAsync(int studentId)
    {
        return await _context.Assignments
            .Include(a => a.Activity)
            .Include(a => a.Teacher)
                .ThenInclude(t => t!.User)
            .Where(a => a.StudentId == studentId || a.Class!.ClassStudents.Any(cs => cs.StudentId == studentId))
            .OrderBy(a => a.DueDate)
            .ToListAsync();
    }

    public async Task<bool> CompleteAssignmentAsync(int assignmentId, double score)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null) return false;

        assignment.IsCompleted = true;
        assignment.CompletedAt = DateTime.UtcNow;
        assignment.Score = score;
        await _context.SaveChangesAsync();
        return true;
    }
}
