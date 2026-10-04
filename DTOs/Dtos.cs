namespace LexiCare.Server.DTOs;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Student"; // Student, Parent, Teacher
    public int? GradeLevel { get; set; }
    public int? Age { get; set; }
    public string? SchoolName { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int? StudentId { get; set; }
    public int? ParentId { get; set; }
    public int? TeacherId { get; set; }
}

public class StudentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int GradeLevel { get; set; }
    public int Age { get; set; }
    public string PreferredTheme { get; set; } = "calm-teal";
    public bool DyslexiaFontEnabled { get; set; }
    public string TextSize { get; set; } = "large";
    public int CurrentStreak { get; set; }
    public int TotalXp { get; set; }
    public int Level { get; set; }
    public List<StudentSkillProgressDto> Skills { get; set; } = new();
    public List<AchievementDto> Achievements { get; set; } = new();
}

public class StudentSkillProgressDto
{
    public int SkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double CurrentScore { get; set; }
    public string Level { get; set; } = string.Empty;
    public double AccuracyRate { get; set; }
    public int TotalAttempts { get; set; }
    public DateTime LastPracticedAt { get; set; }
    public List<string> CommonErrorPatterns { get; set; } = new();
}

public class AchievementDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string BadgeType { get; set; } = string.Empty;
    public int XpBonus { get; set; }
    public DateTime? EarnedAt { get; set; }
}

public class ScreeningQuestionDto
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string AudioPromptText { get; set; } = string.Empty;
    public string? VisualCue { get; set; }
    public List<string> Options { get; set; } = new();
    public int DifficultyLevel { get; set; }
    public string Explanation { get; set; } = string.Empty;
}

public class SubmitScreeningAnswerDto
{
    public int SessionId { get; set; }
    public int QuestionId { get; set; }
    public string SelectedAnswer { get; set; } = string.Empty;
    public int ResponseTimeMs { get; set; }
}

public class ScreeningResultDto
{
    public int SessionId { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public double AccuracyRate { get; set; }
    public double AverageResponseTimeMs { get; set; }
    public string DifficultySummary { get; set; } = string.Empty;
    public string ObservationsSummary { get; set; } = string.Empty;
    public Dictionary<string, double> CategoryBreakdown { get; set; } = new();
    public List<string> DetectedPatterns { get; set; } = new();
    public List<string> RecommendedFocusAreas { get; set; } = new();
    public string Disclaimer { get; set; } = "This screening is for educational support only and is not a medical diagnosis.";
}

public class ActivityDto
{
    public int Id { get; set; }
    public int SkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int DifficultyLevel { get; set; }
    public string ContentJson { get; set; } = "{}";
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
}

public class SubmitActivityAttemptDto
{
    public int StudentId { get; set; }
    public int ActivityId { get; set; }
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int TimeSpentSeconds { get; set; }
    public List<string> ErrorPatterns { get; set; } = new();
}

public class AdaptiveFeedbackDto
{
    public double AccuracyPercentage { get; set; }
    public int XpEarned { get; set; }
    public int CurrentStreak { get; set; }
    public int NewTotalXp { get; set; }
    public int NewLevel { get; set; }
    public int NextRecommendedDifficulty { get; set; }
    public string FeedbackMessage { get; set; } = string.Empty;
    public string GuidanceTip { get; set; } = string.Empty;
    public List<AchievementDto> NewlyEarnedAchievements { get; set; } = new();
}

public class ReadingMaterialDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int GradeLevel { get; set; }
    public string Category { get; set; } = string.Empty;
    public string ContentText { get; set; } = string.Empty;
    public string AudioNarrationText { get; set; } = string.Empty;
    public string LexileLevel { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public Dictionary<string, string> SyllableBreakdown { get; set; } = new();
    public List<ReadingQuestionDto> ComprehensionQuestions { get; set; } = new();
}

public class ReadingQuestionDto
{
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string Answer { get; set; } = string.Empty;
}

public class AIChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public int? StudentId { get; set; }
    public string UserRole { get; set; } = "Parent"; // Parent or Teacher
}

public class AIChatResponseDto
{
    public string Answer { get; set; } = string.Empty;
    public List<string> SuggestedActions { get; set; } = new();
    public List<string> RecommendedActivities { get; set; } = new();
    public string Disclaimer { get; set; } = "LexiCare AI provides educational guidance only and does not provide medical diagnoses.";
}

public class CreateAssignmentDto
{
    public int TeacherId { get; set; }
    public int? ClassId { get; set; }
    public int? StudentId { get; set; }
    public int ActivityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
}

public class CreatePlanDto
{
    public int StudentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RecommendedFocusSkills { get; set; } = string.Empty;
    public int WeeklyGoalMinutes { get; set; } = 60;
}

public class ProgressReportDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int Age { get; set; }
    public int GradeLevel { get; set; }
    public DateTime ReportDate { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public string OverallSummary { get; set; } = string.Empty;
    public Dictionary<string, double> SkillBreakdown { get; set; } = new();
    public string CommonErrorsSummary { get; set; } = string.Empty;
    public string RecommendedActionPlan { get; set; } = string.Empty;
    public string DisclaimerText { get; set; } = "This report provides educational observations and does not constitute a medical diagnosis.";
}

public class UpdateStudentSettingsDto
{
    public string? PreferredTheme { get; set; }
    public bool? DyslexiaFontEnabled { get; set; }
    public string? TextSize { get; set; }
}
