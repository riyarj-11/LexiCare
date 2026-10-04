using LexiCare.Server.DTOs;
using LexiCare.Server.Models;

namespace LexiCare.Server.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetUserByIdAsync(int userId);
}

public interface IStudentService
{
    Task<StudentDto?> GetStudentByIdAsync(int studentId);
    Task<StudentDto?> GetStudentByUserIdAsync(int userId);
    Task<StudentDto> UpdateSettingsAsync(int studentId, UpdateStudentSettingsDto settings);
    Task<List<StudentSkillProgressDto>> GetSkillProgressAsync(int studentId);
    Task<List<AchievementDto>> GetStudentAchievementsAsync(int studentId);
}

public interface IScreeningService
{
    Task<List<ScreeningQuestionDto>> GetQuestionsAsync(int? age = null);
    Task<ScreeningSession> StartSessionAsync(int studentId);
    Task<bool> SubmitResponseAsync(SubmitScreeningAnswerDto answer);
    Task<ScreeningResultDto> CompleteSessionAsync(int sessionId);
    Task<List<ScreeningSession>> GetStudentHistoryAsync(int studentId);
}

public interface ILearningService
{
    Task<List<ActivityDto>> GetActivitiesAsync(int? skillId = null, int? difficulty = null);
    Task<ActivityDto?> GetActivityByIdAsync(int id);
    Task<AdaptiveFeedbackDto> SubmitAttemptAsync(SubmitActivityAttemptDto attempt);
    Task<List<Assignment>> GetStudentAssignmentsAsync(int studentId);
    Task<bool> CompleteAssignmentAsync(int assignmentId, double score);
}

public interface IReadingService
{
    Task<List<ReadingMaterialDto>> GetAllReadingMaterialsAsync();
    Task<ReadingMaterialDto?> GetReadingMaterialByIdAsync(int id);
    Task<ReadingMaterialDto> CreateCustomMaterialAsync(ReadingMaterialDto dto);
}

public interface ITeacherService
{
    Task<object> GetTeacherDashboardDataAsync(int teacherId);
    Task<Class> CreateClassAsync(int teacherId, string name, int gradeLevel, string description);
    Task<bool> EnrollStudentAsync(int classId, int studentId);
    Task<Assignment> CreateAssignmentAsync(CreateAssignmentDto dto);
    Task<LearningPlan> CreatePlanAsync(int teacherUserId, CreatePlanDto dto);
}

public interface IParentService
{
    Task<object> GetParentDashboardDataAsync(int parentId);
}

public interface IAIService
{
    Task<AIChatResponseDto> ProcessChatAsync(AIChatRequestDto request);
    Task<AIRecommendation> GenerateStudentRecommendationAsync(int studentId);
}

public interface IReportService
{
    Task<ProgressReportDto> GenerateReportAsync(int studentId, int? generatedByUserId = null);
    Task<List<ProgressReportDto>> GetReportsForStudentAsync(int studentId);
    Task<ProgressReportDto?> GetReportByIdAsync(int reportId);
}
