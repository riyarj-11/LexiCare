using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly ILearningService _learningService;

    public StudentController(IStudentService studentService, ILearningService learningService)
    {
        _studentService = studentService;
        _learningService = learningService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto>> GetStudent(int id)
    {
        var student = await _studentService.GetStudentByIdAsync(id);
        if (student == null) return NotFound();
        return Ok(student);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<StudentDto>> GetStudentByUserId(int userId)
    {
        var student = await _studentService.GetStudentByUserIdAsync(userId);
        if (student == null) return NotFound();
        return Ok(student);
    }

    [HttpPut("{id}/settings")]
    public async Task<ActionResult<StudentDto>> UpdateSettings(int id, [FromBody] UpdateStudentSettingsDto settings)
    {
        var updated = await _studentService.UpdateSettingsAsync(id, settings);
        return Ok(updated);
    }

    [HttpGet("{id}/skills")]
    public async Task<ActionResult<List<StudentSkillProgressDto>>> GetSkills(int id)
    {
        var skills = await _studentService.GetSkillProgressAsync(id);
        return Ok(skills);
    }

    [HttpGet("{id}/achievements")]
    public async Task<ActionResult<List<AchievementDto>>> GetAchievements(int id)
    {
        var achievements = await _studentService.GetStudentAchievementsAsync(id);
        return Ok(achievements);
    }

    [HttpGet("{id}/assignments")]
    public async Task<IActionResult> GetAssignments(int id)
    {
        var assignments = await _learningService.GetStudentAssignmentsAsync(id);
        var res = assignments.Select(a => new
        {
            a.Id,
            a.Title,
            a.Instructions,
            a.DueDate,
            a.IsCompleted,
            a.CompletedAt,
            a.Score,
            ActivityId = a.ActivityId,
            ActivityTitle = a.Activity?.Title ?? "Activity",
            ActivityType = a.Activity?.Type ?? "General",
            TeacherName = a.Teacher?.User?.FullName ?? "Teacher"
        });
        return Ok(res);
    }
}
