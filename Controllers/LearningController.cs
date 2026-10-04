using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LearningController : ControllerBase
{
    private readonly ILearningService _learningService;

    public LearningController(ILearningService learningService)
    {
        _learningService = learningService;
    }

    [HttpGet("activities")]
    public async Task<ActionResult<List<ActivityDto>>> GetActivities([FromQuery] int? skillId, [FromQuery] int? difficulty)
    {
        var activities = await _learningService.GetActivitiesAsync(skillId, difficulty);
        return Ok(activities);
    }

    [HttpGet("activities/{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivityById(int id)
    {
        var activity = await _learningService.GetActivityByIdAsync(id);
        if (activity == null) return NotFound();
        return Ok(activity);
    }

    [HttpPost("submit-attempt")]
    public async Task<ActionResult<AdaptiveFeedbackDto>> SubmitAttempt([FromBody] SubmitActivityAttemptDto attempt)
    {
        var feedback = await _learningService.SubmitAttemptAsync(attempt);
        return Ok(feedback);
    }

    [HttpPost("assignments/{id}/complete")]
    public async Task<IActionResult> CompleteAssignment(int id, [FromBody] CompleteAssignmentRequest req)
    {
        var success = await _learningService.CompleteAssignmentAsync(id, req.Score);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }

    public class CompleteAssignmentRequest
    {
        public double Score { get; set; }
    }
}
