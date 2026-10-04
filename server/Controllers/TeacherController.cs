using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeacherController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }

    [HttpGet("dashboard/{teacherId}")]
    public async Task<IActionResult> GetDashboard(int teacherId)
    {
        var data = await _teacherService.GetTeacherDashboardDataAsync(teacherId);
        return Ok(data);
    }

    [HttpPost("classes")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest req)
    {
        var cls = await _teacherService.CreateClassAsync(req.TeacherId, req.Name, req.GradeLevel, req.Description);
        return Ok(cls);
    }

    [HttpPost("classes/{classId}/enroll")]
    public async Task<IActionResult> EnrollStudent(int classId, [FromBody] EnrollStudentRequest req)
    {
        var ok = await _teacherService.EnrollStudentAsync(classId, req.StudentId);
        return Ok(new { success = ok });
    }

    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        var assignment = await _teacherService.CreateAssignmentAsync(dto);
        return Ok(assignment);
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan([FromQuery] int teacherUserId, [FromBody] CreatePlanDto dto)
    {
        var plan = await _teacherService.CreatePlanAsync(teacherUserId, dto);
        return Ok(plan);
    }

    public class CreateClassRequest
    {
        public int TeacherId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int GradeLevel { get; set; } = 3;
        public string Description { get; set; } = string.Empty;
    }

    public class EnrollStudentRequest
    {
        public int StudentId { get; set; }
    }
}
