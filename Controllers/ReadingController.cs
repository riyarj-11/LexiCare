using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LexiCare.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingController : ControllerBase
{
    private readonly IReadingService _readingService;

    public ReadingController(IReadingService readingService)
    {
        _readingService = readingService;
    }

    [HttpGet("materials")]
    public async Task<ActionResult<List<ReadingMaterialDto>>> GetMaterials()
    {
        var list = await _readingService.GetAllReadingMaterialsAsync();
        return Ok(list);
    }

    [HttpGet("materials/{id}")]
    public async Task<ActionResult<ReadingMaterialDto>> GetMaterial(int id)
    {
        var item = await _readingService.GetReadingMaterialByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("custom")]
    public async Task<ActionResult<ReadingMaterialDto>> CreateCustom([FromBody] ReadingMaterialDto dto)
    {
        var item = await _readingService.CreateCustomMaterialAsync(dto);
        return Ok(item);
    }
}
