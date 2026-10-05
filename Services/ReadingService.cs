using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class ReadingService : IReadingService
{
    private readonly LexiCareDbContext _context;

    public ReadingService(LexiCareDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReadingMaterialDto>> GetAllReadingMaterialsAsync()
    {
        var list = await _context.ReadingMaterials.OrderBy(r => r.GradeLevel).ToListAsync();
        return list.Select(MapToDto).ToList();
    }

    public async Task<ReadingMaterialDto?> GetReadingMaterialByIdAsync(int id)
    {
        var item = await _context.ReadingMaterials.FindAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ReadingMaterialDto> CreateCustomMaterialAsync(ReadingMaterialDto dto)
    {
        var words = dto.ContentText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var wordCount = words.Length;

        // Simple automated syllable breakdown generator for custom text
        var syllableDict = new Dictionary<string, string>();
        foreach (var word in words.Distinct())
        {
            var cleanWord = new string(word.Where(char.IsLetter).ToArray());
            if (cleanWord.Length > 4 && !syllableDict.ContainsKey(cleanWord))
            {
                syllableDict[cleanWord] = ApproximateSyllables(cleanWord);
            }
        }

        var entity = new ReadingMaterial
        {
            Title = string.IsNullOrWhiteSpace(dto.Title) ? "Custom Reading Passage" : dto.Title,
            GradeLevel = dto.GradeLevel > 0 ? dto.GradeLevel : 3,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "Custom" : dto.Category,
            ContentText = dto.ContentText,
            AudioNarrationText = dto.ContentText,
            LexileLevel = $"{Math.Min(900, Math.Max(200, wordCount * 5))}L",
            WordCount = wordCount,
            SyllableBreakdownJson = JsonSerializer.Serialize(syllableDict),
            ComprehensionQuestionsJson = JsonSerializer.Serialize(dto.ComprehensionQuestions)
        };

        await _context.ReadingMaterials.AddAsync(entity);
        await _context.SaveChangesAsync();

        return MapToDto(entity);
    }

    private static ReadingMaterialDto MapToDto(ReadingMaterial item)
    {
        return new ReadingMaterialDto
        {
            Id = item.Id,
            Title = item.Title,
            GradeLevel = item.GradeLevel,
            Category = item.Category,
            ContentText = item.ContentText,
            AudioNarrationText = item.AudioNarrationText,
            LexileLevel = item.LexileLevel,
            WordCount = item.WordCount,
            SyllableBreakdown = ParseSyllableJson(item.SyllableBreakdownJson),
            ComprehensionQuestions = ParseQuestionsJson(item.ComprehensionQuestionsJson)
        };
    }

    private static Dictionary<string, string> ParseSyllableJson(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new();
        }
        catch
        {
            return new();
        }
    }

    private static List<ReadingQuestionDto> ParseQuestionsJson(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<ReadingQuestionDto>>(json) ?? new();
        }
        catch
        {
            return new();
        }
    }

    private static string ApproximateSyllables(string word)
    {
        if (word.Length <= 4) return word;
        var vowels = "aeiouyAEIOUY";
        var parts = new List<string>();
        int start = 0;
        for (int i = 1; i < word.Length - 1; i++)
        {
            if (vowels.Contains(word[i]) && !vowels.Contains(word[i + 1]) && i - start >= 2)
            {
                parts.Add(word.Substring(start, i + 1 - start));
                start = i + 1;
            }
        }
        if (start < word.Length)
        {
            parts.Add(word.Substring(start));
        }
        return parts.Count > 1 ? string.Join("-", parts) : word;
    }
}
