using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost("generate")]
    public async Task<ActionResult<ProgressReportDto>> Generate([FromBody] GenerateReportRequest req)
    {
        var report = await _reportService.GenerateReportAsync(req.StudentId, req.GeneratedByUserId);
        return Ok(report);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<List<ProgressReportDto>>> GetReportsForStudent(int studentId)
    {
        var list = await _reportService.GetReportsForStudentAsync(studentId);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProgressReportDto>> GetReport(int id)
    {
        var report = await _reportService.GetReportByIdAsync(id);
        if (report == null) return NotFound();
        return Ok(report);
    }

    public class GenerateReportRequest
    {
        public int StudentId { get; set; }
        public int? GeneratedByUserId { get; set; }
    }
}
