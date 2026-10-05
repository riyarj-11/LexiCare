using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AIChatResponseDto>> Chat([FromBody] AIChatRequestDto request)
    {
        var response = await _aiService.ProcessChatAsync(request);
        return Ok(response);
    }

    [HttpGet("recommendation/{studentId}")]
    public async Task<IActionResult> GetRecommendation(int studentId)
    {
        var rec = await _aiService.GenerateStudentRecommendationAsync(studentId);
        return Ok(rec);
    }
}
