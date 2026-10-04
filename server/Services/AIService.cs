using System.Text.Json;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Services;

public class AIService : IAIService
{
    private readonly LexiCareDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public AIService(LexiCareDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<AIChatResponseDto> ProcessChatAsync(AIChatRequestDto request)
    {
        var msg = request.Message.Trim().ToLower();
        var studentContext = "";

        if (request.StudentId.HasValue)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.SkillProgresses)
                    .ThenInclude(sp => sp.Skill)
                .FirstOrDefaultAsync(s => s.Id == request.StudentId.Value);

            if (student != null)
            {
                var lowestSkill = student.SkillProgresses.OrderBy(sp => sp.CurrentScore).FirstOrDefault();
                studentContext = $"Student: {student.User?.FullName}, Grade {student.GradeLevel}. Lowest skill: {lowestSkill?.Skill?.Name} ({lowestSkill?.CurrentScore}%). ";
            }
        }

        // Try LLM API if key is present
        var apiKey = _configuration["AI:ApiKey"];
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var llmResponse = await CallExternalLlmAsync(apiKey, request.Message, studentContext, request.UserRole);
                if (!string.IsNullOrWhiteSpace(llmResponse))
                {
                    return new AIChatResponseDto
                    {
                        Answer = llmResponse,
                        SuggestedActions = new() { "Practice 5-minute multisensory games", "Try LexiCare Reading Assistant", "Check Weekly Progress Report" },
                        RecommendedActivities = new() { "B vs D Detective", "Sound to Letter Builder" }
                    };
                }
            }
            catch
            {
                // Fall back gracefully to pedagogical engine
            }
        }

        // Research-backed Pedagogical Rule Engine (Orton-Gillingham & Structured Literacy Informed)
        return GeneratePedagogicalResponse(request.Message, studentContext, request.UserRole);
    }

    public async Task<AIRecommendation> GenerateStudentRecommendationAsync(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.SkillProgresses)
                .ThenInclude(sp => sp.Skill)
            .Include(s => s.ScreeningSessions)
                .ThenInclude(ss => ss.Responses)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
        {
            throw new KeyNotFoundException("Student not found.");
        }

        var skills = student.SkillProgresses.OrderBy(sp => sp.CurrentScore).ToList();
        var lowest = skills.FirstOrDefault();
        var lowestName = lowest?.Skill?.Name ?? "Phonics";

        var lastSession = student.ScreeningSessions.OrderByDescending(s => s.CreatedAt).FirstOrDefault();
        var detectedErrors = lastSession?.Responses
            .Where(r => !r.IsCorrect && !string.IsNullOrEmpty(r.ErrorPatternDetected))
            .Select(r => r.ErrorPatternDetected)
            .Distinct()
            .ToList() ?? new List<string>();

        string issue;
        string recText;
        string parentExp;
        string teacherExp;
        var actList = new List<string>();

        if (detectedErrors.Contains("b_d_confusion") || lowestName == "Word Recognition")
        {
            issue = "Visual letter discrimination hesitation (confusing 'b' and 'd')";
            recText = "Implement tactile letter reinforcement (tracing letters in sand or kinetic sand). Practice the 'bed' visual anchor where fists represent the headboard (b) and footboard (d).";
            parentExp = $"{student.User?.FullName} has wonderful comprehension! When reading quickly, letters that look similar (like 'b' and 'd') can flip in the mind. Using simple hand cues and 5-minute detective games will build quick visual recognition.";
            teacherExp = "Recommend structured multi-sensory discrimination drills focusing on motor memory (skywriting, textured cards). Pair visual cues with auditory phoneme /b/ and /d/ isolation.";
            actList.AddRange(new[] { "B vs D Detective", "Sentence Flow & Fluency" });
        }
        else if (detectedErrors.Contains("phonetic_substitution") || lowestName == "Spelling" || lowestName == "Phonics")
        {
            issue = "Phonetic spelling transcription (spelling words exactly as they sound, e.g., 'cat' as 'kat')";
            recText = "Focus on orthographic rules and phoneme-to-grapheme mappings. Reinforce the 'C vs K' spelling rule: C partners with a, o, u, while K partners with e and i.";
            parentExp = $"{student.User?.FullName} is doing a great job sounding out words! Writing 'kat' shows strong hearing skills. We are now helping them remember standard English spelling patterns through playful card games.";
            teacherExp = "Implement explicit grapheme-phoneme mapping and orthographic rule instruction (e.g. C/K spelling generalizations, silent-e markers). Use Elkonin sound boxes for phonemic segmentation.";
            actList.AddRange(new[] { "Sound to Letter Builder", "Spelling Power: C vs K" });
        }
        else
        {
            issue = "Building reading stamina and multi-syllable word decoding";
            recText = "Use the LexiCare Reading Assistant with sentence-by-sentence pacing, dyslexia-friendly fonts, and syllable breakdown toggles.";
            parentExp = $"{student.User?.FullName} is steadily building confidence. Reading together for 10 minutes a day with highlighted text pacing will boost fluency without fatigue.";
            teacherExp = "Support with morphology, prefix/suffix identification, and guided choral reading. Encourage independent reading with assistive text-to-speech tools.";
            actList.AddRange(new[] { "The Secret Treehouse Adventure", "Sentence Flow & Fluency" });
        }

        var recommendation = new AIRecommendation
        {
            StudentId = student.Id,
            GeneratedBy = "LexiCare AI Educational Engine",
            FocusSkill = lowestName,
            IssueIdentified = issue,
            RecommendationText = recText,
            ParentExplanation = parentExp,
            TeacherExplanation = teacherExp,
            RecommendedActivitiesJson = JsonSerializer.Serialize(actList),
            SeverityLevel = lowest?.CurrentScore < 60 ? "AttentionNeeded" : "Moderate",
            CreatedAt = DateTime.UtcNow
        };

        await _context.AIRecommendations.AddAsync(recommendation);
        await _context.SaveChangesAsync();
        return recommendation;
    }

    private static AIChatResponseDto GeneratePedagogicalResponse(string query, string studentContext, string role)
    {
        var q = query.ToLower();

        if (q.Contains("phonics") || q.Contains("sound") || q.Contains("letter"))
        {
            return new AIChatResponseDto
            {
                Answer = $"Great question! To strengthen phonics and sound awareness, multi-sensory techniques are the most effective:\n\n" +
                         $"1. **Sound-to-Letter Building:** Have the student tap each individual sound on their fingers before writing the letters (e.g., /k/ - /a/ - /t/).\n" +
                         $"2. **Elkonin Sound Boxes:** Draw 3 or 4 connected boxes and have the child push a token or coin into each box for every sound heard.\n" +
                         $"3. **Auditory Rhyming Games:** Play quick verbal games during car rides or morning routines (e.g., 'What rhymes with lake? Bake, cake, snake!').\n\n" +
                         $"Keep each practice burst to 5–7 minutes so the student remains enthusiastic and avoids cognitive fatigue.",
                SuggestedActions = new() { "Try Sound to Letter Builder activity", "Practice 5-minute auditory rhyming", "Enable Syllable Highlights in Reading Assistant" },
                RecommendedActivities = new() { "Sound to Letter Builder", "Spelling Power: C vs K" }
            };
        }

        if (q.Contains("b") && q.Contains("d") || q.Contains("revers") || q.Contains("flip"))
        {
            return new AIChatResponseDto
            {
                Answer = $"Confusing 'b' and 'd' is very common in developing readers and does not automatically indicate a permanent learning disability.\n\n" +
                         $"**Why it happens:** In everyday objects, a chair is still a chair whether it faces left or right. But in written language, direction creates an entirely different letter!\n\n" +
                         $"**Helpful visual anchors:**\n" +
                         $"• **The 'Bed' Trick:** Make two fists with thumbs up. Left hand forms 'b', right hand forms 'd'. Together they spell 'b-e-d' — the shape of a bed!\n" +
                         $"• **Belly vs Diaper:** 'b' has a belly walking forward; 'd' has a diaper trailing behind.\n" +
                         $"• **Tactile Tracing:** Trace the letter in sand, shaving foam, or on sandpaper while saying the sound aloud.",
                SuggestedActions = new() { "Practice 'B vs D Detective' interactive game", "Use the 'Bed' hand gesture before reading", "Add visual stickers to writing desk" },
                RecommendedActivities = new() { "B vs D Detective" }
            };
        }

        if (q.Contains("struggle") || q.Contains("hard") || q.Contains("word") || q.Contains("kat") || q.Contains("spelling"))
        {
            return new AIChatResponseDto
            {
                Answer = $"When a child spells words like 'cat' as 'kat', it actually shows that their **phonemic awareness is working well** — they accurately heard the /k/ sound!\n\n" +
                         $"The challenge is **orthographic memory** (recalling which letter is conventionally used in English). In English, 'k' goes before 'e' and 'i' (like kitten, kite), while 'c' goes before 'a', 'o', 'u' (cat, cot, cup).\n\n" +
                         $"**Suggested Support:**\n" +
                         $"1. Celebrate their phonetic hearing first ('You heard every sound perfectly!').\n" +
                         $"2. Teach the visual pattern using color cards (highlighting 'ca', 'co', 'cu' in one color).\n" +
                         $"3. Use the LexiCare Spelling Power activity for 5 minutes daily.",
                SuggestedActions = new() { "Review Spelling Power activity", "Use color-coded vowel letter cards", "Review weekly screening trends" },
                RecommendedActivities = new() { "Spelling Power: C vs K", "Sound to Letter Builder" }
            };
        }

        if (q.Contains("diagnos") || q.Contains("dyslexia") || q.Contains("doctor") || q.Contains("specialist"))
        {
            return new AIChatResponseDto
            {
                Answer = $"**Important Reminder:** LexiCare is an educational support system designed to identify learning patterns and provide personalized practice. It does **not** provide medical or formal clinical diagnoses.\n\n" +
                         $"If a student demonstrates persistent reading, spelling, or phonological difficulties despite consistent structured practice, we recommend consulting:\n" +
                         $"• A certified **Educational Psychologist**\n" +
                         $"• A licensed **Speech-Language Pathologist (SLP)**\n" +
                         $"• The school's **Special Education / Reading Specialist team** for a comprehensive psycho-educational evaluation.\n\n" +
                         $"You can export the LexiCare Progress Report as a PDF to share documented screening observations and exercise history with your specialist.",
                SuggestedActions = new() { "Export PDF Progress Report", "Schedule meeting with school reading specialist", "Review historical screening sessions" },
                RecommendedActivities = new() { "Sentence Flow & Fluency" }
            };
        }

        // Default supportive educational guidance
        return new AIChatResponseDto
        {
            Answer = $"Hello! I am your LexiCare Educational AI Assistant. I provide practical, research-informed strategies for reading, phonics, and spelling development.\n\n" +
                     $"{(string.IsNullOrEmpty(studentContext) ? "" : $"*Current student context:* {studentContext}\n\n")}" +
                     $"How can I help you today? You can ask me:\n" +
                     $"• *'Why does my child confuse b and d?'*\n" +
                     $"• *'What activities can help improve phonics this week?'*\n" +
                     $"• *'Why do they spell words like cat as kat?'*\n" +
                     $"• *'How can I make reading practice less stressful at home?'*",
            SuggestedActions = new() { "Ask about b/d reversals", "Ask about phonics exercises", "Ask for weekly practice plan" },
            RecommendedActivities = new() { "B vs D Detective", "The Secret Treehouse Adventure" }
        };
    }

    private async Task<string?> CallExternalLlmAsync(string apiKey, string prompt, string studentContext, string role)
    {
        // Placeholder for OpenAI-compatible endpoint
        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = new[]
            {
                new { role = "system", content = "You are LexiCare's educational AI assistant. You provide encouraging, multi-sensory educational strategies for parents and teachers of children with reading difficulties. NEVER make a medical diagnosis. Always recommend speaking to a qualified educational psychologist if serious concerns arise." },
                new { role = "user", content = $"{studentContext}\nUser role: {role}\nQuestion: {prompt}" }
            },
            max_tokens = 400
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        var res = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
        if (res.IsSuccessStatusCode)
        {
            var resString = await res.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(resString);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }
        return null;
    }
}
