using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParentController : ControllerBase
{
    private readonly IParentService _parentService;

    public ParentController(IParentService parentService)
    {
        _parentService = parentService;
    }

    [HttpGet("dashboard/{parentId}")]
    public async Task<IActionResult> GetDashboard(int parentId)
    {
        var data = await _parentService.GetParentDashboardDataAsync(parentId);
        return Ok(data);
    }
}
