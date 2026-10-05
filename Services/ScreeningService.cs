using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class ScreeningService : IScreeningService
{
    private readonly LexiCareDbContext _context;

    public ScreeningService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<List<ScreeningQuestionDto>> GetQuestionsAsync(int? age = null)
    {
        var query = _context.ScreeningQuestions.AsQueryable();
        if (age.HasValue)
        {
            query = query.Where(q => q.TargetAgeMin <= age.Value && q.TargetAgeMax >= age.Value);
        }

        var questions = await query.ToListAsync();

        return questions.Select(q => new ScreeningQuestionDto
        {
            Id = q.Id,
            Category = q.Category,
            SubCategory = q.SubCategory,
            QuestionText = q.QuestionText,
            AudioPromptText = q.AudioPromptText,
            VisualCue = q.VisualCue,
            Options = ParseJsonList(q.OptionsJson),
            DifficultyLevel = q.DifficultyLevel,
            Explanation = q.Explanation
        }).ToList();
    }

    public async Task<ScreeningSession> StartSessionAsync(int studentId)
    {
        var session = new ScreeningSession
        {
            StudentId = studentId,
            StartTime = DateTime.UtcNow,
            DisclaimerConfirmed = true,
            DifficultySummary = "In Progress..."
        };

        await _context.ScreeningSessions.AddAsync(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task<bool> SubmitResponseAsync(SubmitScreeningAnswerDto answer)
    {
        var session = await _context.ScreeningSessions.FindAsync(answer.SessionId);
        var question = await _context.ScreeningQuestions.FindAsync(answer.QuestionId);

        if (session == null || question == null)
        {
            return false;
        }

        var isCorrect = string.Equals(question.CorrectAnswer.Trim(), answer.SelectedAnswer.Trim(), StringComparison.OrdinalIgnoreCase);
        var errorTag = isCorrect ? string.Empty : question.ErrorPatternTag;

        var response = new ScreeningResponse
        {
            SessionId = session.Id,
            QuestionId = question.Id,
            SelectedAnswer = answer.SelectedAnswer,
            IsCorrect = isCorrect,
            ResponseTimeMs = answer.ResponseTimeMs,
            ErrorPatternDetected = errorTag,
            CreatedAt = DateTime.UtcNow
        };

        await _context.ScreeningResponses.AddAsync(response);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ScreeningResultDto> CompleteSessionAsync(int sessionId)
    {
        var session = await _context.ScreeningSessions
            .Include(s => s.Responses)
                .ThenInclude(r => r.Question)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
        {
            throw new KeyNotFoundException("Screening session not found.");
        }

        var responses = session.Responses.ToList();
        var total = responses.Count;
        var correct = responses.Count(r => r.IsCorrect);
        var accuracy = total > 0 ? (double)correct / total * 100.0 : 0.0;
        var avgTime = total > 0 ? responses.Average(r => r.ResponseTimeMs) : 0.0;

        // Safety-compliant classification
        string summary;
        if (accuracy >= 80.0)
        {
            summary = "No significant difficulty observed";
        }
        else if (accuracy >= 60.0)
        {
            summary = "Some areas may benefit from additional practice";
        }
        else
        {
            summary = "Consistent difficulty observed — consider consulting a qualified specialist";
        }

        // Category breakdown
        var categoryBreakdown = new Dictionary<string, double>();
        var groupedByCategory = responses.GroupBy(r => r.Question?.Category ?? "General");
        foreach (var group in groupedByCategory)
        {
            var catTotal = group.Count();
            var catCorrect = group.Count(r => r.IsCorrect);
            categoryBreakdown[group.Key] = Math.Round((double)catCorrect / catTotal * 100.0, 1);
        }

        // Identify detected error patterns
        var detectedPatterns = responses
            .Where(r => !r.IsCorrect && !string.IsNullOrEmpty(r.ErrorPatternDetected))
            .Select(r => r.ErrorPatternDetected)
            .Distinct()
            .ToList();

        // Recommended focus areas based on low accuracy categories & error patterns
        var recommendedFocus = new List<string>();
        foreach (var (cat, catAcc) in categoryBreakdown)
        {
            if (catAcc < 75.0)
            {
                recommendedFocus.Add(cat);
            }
        }
        if (detectedPatterns.Contains("b_d_confusion"))
        {
            recommendedFocus.Add("Visual Letter Discrimination (b vs d)");
        }
        if (detectedPatterns.Contains("phonetic_substitution"))
        {
            recommendedFocus.Add("Phoneme-to-Grapheme Spelling Rules");
        }
        if (recommendedFocus.Count == 0)
        {
            recommendedFocus.Add("Fluency Maintenance & Enrichment Reading");
        }

        // Construct narrative observations
        var observations = $"Completed screening with {total} tasks. Accuracy: {accuracy:F1}%, Avg Response Time: {avgTime / 1000.0:F1}s. ";
        if (detectedPatterns.Count > 0)
        {
            observations += $"Patterns noted for targeted educational support: {string.Join(", ", detectedPatterns.Select(FormatErrorPatternName))}. ";
        }
        observations += "Student strengths and targeted practice areas have been updated in the personalized learning engine.";

        session.CompletedTime = DateTime.UtcNow;
        session.TotalQuestions = total;
        session.CorrectAnswers = correct;
        session.AccuracyRate = Math.Round(accuracy, 1);
        session.AverageResponseTimeMs = Math.Round(avgTime, 0);
        session.DifficultySummary = summary;
        session.ObservationsSummary = observations;

        // Also update student skill progress with newly discovered patterns
        var studentSkills = await _context.StudentSkillProgresses
            .Include(sp => sp.Skill)
            .Where(sp => sp.StudentId == session.StudentId)
            .ToListAsync();

        foreach (var (cat, score) in categoryBreakdown)
        {
            var matchedProgress = studentSkills.FirstOrDefault(sp => sp.Skill != null &&
                (sp.Skill.Name.Equals(cat, StringComparison.OrdinalIgnoreCase) ||
                 sp.Skill.Category.Contains(cat, StringComparison.OrdinalIgnoreCase)));

            if (matchedProgress != null)
            {
                // Weighted update with recent screening
                matchedProgress.CurrentScore = Math.Round((matchedProgress.CurrentScore * 0.6) + (score * 0.4), 1);
                matchedProgress.TotalAttempts += 1;
                matchedProgress.LastPracticedAt = DateTime.UtcNow;
                if (matchedProgress.CurrentScore >= 85) matchedProgress.Level = "Mastered";
                else if (matchedProgress.CurrentScore >= 70) matchedProgress.Level = "Proficient";
                else if (matchedProgress.CurrentScore >= 55) matchedProgress.Level = "Developing";
                else matchedProgress.Level = "Beginner";
            }
        }

        await _context.SaveChangesAsync();

        return new ScreeningResultDto
        {
            SessionId = session.Id,
            TotalQuestions = total,
            CorrectAnswers = correct,
            AccuracyRate = Math.Round(accuracy, 1),
            AverageResponseTimeMs = Math.Round(avgTime, 0),
            DifficultySummary = summary,
            ObservationsSummary = observations,
            CategoryBreakdown = categoryBreakdown,
            DetectedPatterns = detectedPatterns,
            RecommendedFocusAreas = recommendedFocus.Distinct().ToList(),
            Disclaimer = "This screening is for educational support only and is not a medical diagnosis."
        };
    }

    public async Task<List<ScreeningSession>> GetStudentHistoryAsync(int studentId)
    {
        return await _context.ScreeningSessions
            .Where(s => s.StudentId == studentId && s.CompletedTime != null)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
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
