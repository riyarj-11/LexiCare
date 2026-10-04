using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScreeningController : ControllerBase
{
    private readonly IScreeningService _screeningService;

    public ScreeningController(IScreeningService screeningService)
    {
        _screeningService = screeningService;
    }

    [HttpGet("questions")]
    public async Task<ActionResult<List<ScreeningQuestionDto>>> GetQuestions([FromQuery] int? age)
    {
        var questions = await _screeningService.GetQuestionsAsync(age);
        return Ok(questions);
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] StartSessionRequest req)
    {
        var session = await _screeningService.StartSessionAsync(req.StudentId);
        return Ok(new { sessionId = session.Id, session.StartTime, session.DisclaimerConfirmed });
    }

    [HttpPost("submit-answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] SubmitScreeningAnswerDto answer)
    {
        var success = await _screeningService.SubmitResponseAsync(answer);
        if (!success) return BadRequest(new { message = "Failed to record response." });
        return Ok(new { success = true });
    }

    [HttpPost("complete/{sessionId}")]
    public async Task<ActionResult<ScreeningResultDto>> CompleteSession(int sessionId)
    {
        var result = await _screeningService.CompleteSessionAsync(sessionId);
        return Ok(result);
    }

    [HttpGet("history/{studentId}")]
    public async Task<IActionResult> GetHistory(int studentId)
    {
        var history = await _screeningService.GetStudentHistoryAsync(studentId);
        var res = history.Select(h => new
        {
            h.Id,
            h.StartTime,
            h.CompletedTime,
            h.TotalQuestions,
            h.CorrectAnswers,
            h.AccuracyRate,
            h.AverageResponseTimeMs,
            h.DifficultySummary,
            h.ObservationsSummary
        });
        return Ok(res);
    }

    public class StartSessionRequest
    {
        public int StudentId { get; set; }
    }
}
