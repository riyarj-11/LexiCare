using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LexiCare.Server.Models;

public enum UserRole
{
    Student,
    Parent,
    Teacher,
    Admin
}

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Student? StudentProfile { get; set; }
    public Parent? ParentProfile { get; set; }
    public Teacher? TeacherProfile { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class Student
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public int? ParentId { get; set; }
    [ForeignKey(nameof(ParentId))]
    public Parent? Parent { get; set; }

    public int GradeLevel { get; set; } = 3;
    public int Age { get; set; } = 8;
    public string PreferredTheme { get; set; } = "calm-teal";
    public bool DyslexiaFontEnabled { get; set; } = true;
    public string TextSize { get; set; } = "large"; // medium, large, xlarge

    public int CurrentStreak { get; set; } = 0;
    public int TotalXp { get; set; } = 0;
    public int Level { get; set; } = 1;
    public DateTime? LastActiveDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<StudentSkillProgress> SkillProgresses { get; set; } = new List<StudentSkillProgress>();
    public ICollection<ScreeningSession> ScreeningSessions { get; set; } = new List<ScreeningSession>();
    public ICollection<ActivityAttempt> ActivityAttempts { get; set; } = new List<ActivityAttempt>();
    public ICollection<StudentAchievement> StudentAchievements { get; set; } = new List<StudentAchievement>();
    public ICollection<LearningPlan> LearningPlans { get; set; } = new List<LearningPlan>();
    public ICollection<AIRecommendation> AIRecommendations { get; set; } = new List<AIRecommendation>();
    public ICollection<ProgressReport> ProgressReports { get; set; } = new List<ProgressReport>();
    public ICollection<ClassStudent> ClassEnrollments { get; set; } = new List<ClassStudent>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}

public class Parent
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Student> Children { get; set; } = new List<Student>();
}

public class Teacher
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string SchoolName { get; set; } = string.Empty;
    public string Subject { get; set; } = "Reading Specialist";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Class> Classes { get; set; } = new List<Class>();
    public ICollection<Assignment> AssignedWork { get; set; } = new List<Assignment>();
}

public class Class
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int TeacherId { get; set; }
    [ForeignKey(nameof(TeacherId))]
    public Teacher? Teacher { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int GradeLevel { get; set; } = 3;
    public string AcademicYear { get; set; } = "2026-2027";
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}

public class ClassStudent
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ClassId { get; set; }
    [ForeignKey(nameof(ClassId))]
    public Class? Class { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
}

public class Skill
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty; // Phonics, Reading, Spelling, Vocabulary, Comprehension, Word Recognition

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 0;

    public ICollection<StudentSkillProgress> StudentProgresses { get; set; } = new List<StudentSkillProgress>();
    public ICollection<LearningActivity> Activities { get; set; } = new List<LearningActivity>();
}

public class StudentSkillProgress
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [Required]
    public int SkillId { get; set; }
    [ForeignKey(nameof(SkillId))]
    public Skill? Skill { get; set; }

    public double CurrentScore { get; set; } = 70.0; // 0-100
    public string Level { get; set; } = "Developing"; // Beginner, Developing, Proficient, Mastered
    public double AccuracyRate { get; set; } = 70.0;
    public int TotalAttempts { get; set; } = 0;
    public DateTime LastPracticedAt { get; set; } = DateTime.UtcNow;
    public string CommonErrorPatterns { get; set; } = "[]"; // JSON array of detected error tags
}

public class ScreeningQuestion
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Category { get; set; } = "Reading"; // Reading, Phonics, Spelling, Comprehension

    [Required, MaxLength(100)]
    public string SubCategory { get; set; } = "LetterDiscrimination"; // bdReversal, LetterSound, Rhyme, WordSegmentation, etc.

    public int TargetAgeMin { get; set; } = 6;
    public int TargetAgeMax { get; set; } = 12;

    [Required]
    public string QuestionText { get; set; } = string.Empty;

    public string AudioPromptText { get; set; } = string.Empty;
    public string? VisualCue { get; set; }

    [Required]
    public string OptionsJson { get; set; } = "[]"; // JSON array of options

    [Required]
    public string CorrectAnswer { get; set; } = string.Empty;

    public int DifficultyLevel { get; set; } = 1; // 1-5
    public string Explanation { get; set; } = string.Empty;
    public string ErrorPatternTag { get; set; } = string.Empty; // e.g., "b_d_confusion", "phonetic_substitution", "vowel_omission"
}

public class ScreeningSession
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedTime { get; set; }

    public int TotalQuestions { get; set; } = 0;
    public int CorrectAnswers { get; set; } = 0;
    public double AccuracyRate { get; set; } = 0.0;
    public double AverageResponseTimeMs { get; set; } = 0.0;

    // Safety-compliant result statement:
    // 1. "No significant difficulty observed"
    // 2. "Some areas may benefit from additional practice"
    // 3. "Consistent difficulty observed — consider consulting a qualified specialist"
    public string DifficultySummary { get; set; } = "No significant difficulty observed";

    public string ObservationsSummary { get; set; } = string.Empty;
    public bool DisclaimerConfirmed { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ScreeningResponse> Responses { get; set; } = new List<ScreeningResponse>();
}

public class ScreeningResponse
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SessionId { get; set; }
    [ForeignKey(nameof(SessionId))]
    public ScreeningSession? Session { get; set; }

    [Required]
    public int QuestionId { get; set; }
    [ForeignKey(nameof(QuestionId))]
    public ScreeningQuestion? Question { get; set; }

    public string SelectedAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int ResponseTimeMs { get; set; }
    public string ErrorPatternDetected { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class LearningActivity
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SkillId { get; set; }
    [ForeignKey(nameof(SkillId))]
    public Skill? Skill { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "LetterDiscrimination"; // LetterDiscrimination, WordBuilding, SoundMatching, SpellingQuiz, GuidedReading, ComprehensionQuiz
    public int DifficultyLevel { get; set; } = 1; // 1 to 5
    public string ContentJson { get; set; } = "{}"; // Interactive task payload
    public int MinAge { get; set; } = 6;
    public int MaxAge { get; set; } = 12;
    public int EstimatedMinutes { get; set; } = 5;
    public int XpReward { get; set; } = 50;

    public ICollection<ActivityAttempt> Attempts { get; set; } = new List<ActivityAttempt>();
}

public class ActivityAttempt
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [Required]
    public int ActivityId { get; set; }
    [ForeignKey(nameof(ActivityId))]
    public LearningActivity? Activity { get; set; }

    public int Score { get; set; }
    public int MaxScore { get; set; }
    public double AccuracyPercentage { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public int DifficultyAdjustedTo { get; set; } = 1;
    public string ErrorPatternsIdentified { get; set; } = "[]";
}

public class LearningPlan
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    public int CreatedByUserId { get; set; }
    [ForeignKey(nameof(CreatedByUserId))]
    public User? CreatedByUser { get; set; }

    public string Title { get; set; } = "Personalized Growth Plan";
    public string Description { get; set; } = string.Empty;
    public string RecommendedFocusSkills { get; set; } = "Phonics, Spelling";
    public int WeeklyGoalMinutes { get; set; } = 60;
    public string Status { get; set; } = "Active"; // Active, Completed, Paused
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Assignment
{
    [Key]
    public int Id { get; set; }

    public int? ClassId { get; set; }
    [ForeignKey(nameof(ClassId))]
    public Class? Class { get; set; }

    [Required]
    public int TeacherId { get; set; }
    [ForeignKey(nameof(TeacherId))]
    public Teacher? Teacher { get; set; }

    public int? StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [Required]
    public int ActivityId { get; set; }
    [ForeignKey(nameof(ActivityId))]
    public LearningActivity? Activity { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public double? Score { get; set; }
}

public class ReadingMaterial
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public int GradeLevel { get; set; } = 3;
    public string Category { get; set; } = "Adventure"; // Nature, Animals, Adventure, Science, Friendship
    
    [Required]
    public string ContentText { get; set; } = string.Empty;

    public string AudioNarrationText { get; set; } = string.Empty;
    public string LexileLevel { get; set; } = "420L";
    public int WordCount { get; set; } = 0;
    public string SyllableBreakdownJson { get; set; } = "{}"; // Word -> Syllables mapping
    public string ComprehensionQuestionsJson { get; set; } = "[]"; // JSON array of questions
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Achievement
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "Award";
    public string BadgeType { get; set; } = "General"; // FirstReadingSession, WordsMastered10, PhonicsExplorer, Streak7, ReadingChampion
    public int XpBonus { get; set; } = 100;
}

public class StudentAchievement
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [Required]
    public int AchievementId { get; set; }
    [ForeignKey(nameof(AchievementId))]
    public Achievement? Achievement { get; set; }

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = "Info"; // Alert, ProgressUpdate, Recommendation, Reminder
    public bool IsRead { get; set; } = false;
    public string ActionUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AIRecommendation
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    public string GeneratedBy { get; set; } = "AI Educational Engine";
    public string FocusSkill { get; set; } = "Phonics";
    public string IssueIdentified { get; set; } = "Visual letter discrimination (b vs d)";
    public string RecommendationText { get; set; } = string.Empty;
    public string ParentExplanation { get; set; } = string.Empty;
    public string TeacherExplanation { get; set; } = string.Empty;
    public string RecommendedActivitiesJson { get; set; } = "[]";
    public string SeverityLevel { get; set; } = "Moderate"; // Low, Moderate, AttentionNeeded
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProgressReport
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    public int? GeneratedByUserId { get; set; }
    [ForeignKey(nameof(GeneratedByUserId))]
    public User? GeneratedByUser { get; set; }

    public DateTime ReportDate { get; set; } = DateTime.UtcNow;
    public DateTime PeriodStart { get; set; } = DateTime.UtcNow.AddDays(-30);
    public DateTime PeriodEnd { get; set; } = DateTime.UtcNow;

    public string OverallSummary { get; set; } = string.Empty;
    public string SkillBreakdownJson { get; set; } = "{}";
    public string CommonErrorsSummary { get; set; } = string.Empty;
    public string RecommendedActionPlan { get; set; } = string.Empty;

    // MANDATORY DISCLAIMER
    public string DisclaimerText { get; set; } = "This report provides educational observations and does not constitute a medical diagnosis.";
    public string? ExportedPdfUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
