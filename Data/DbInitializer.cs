using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LexiCare.Server.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(LexiCareDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // Already seeded
        }

        // 1. Seed Skills
        var skills = new List<Skill>
        {
            new() { Name = "Phonics", Category = "Phonological Awareness", Description = "Matching speech sounds with letters and letter combinations (graphemes and phonemes)", OrderIndex = 1 },
            new() { Name = "Reading", Category = "Fluency & Decoding", Description = "Recognizing sight words and decoding simple to complex sentences smoothly", OrderIndex = 2 },
            new() { Name = "Spelling", Category = "Orthographic Processing", Description = "Applying spelling rules, letter sequencing, and identifying visual patterns", OrderIndex = 3 },
            new() { Name = "Word Recognition", Category = "Visual Processing", Description = "Differentiating visually similar letters (such as b/d, p/q) and sight words", OrderIndex = 4 },
            new() { Name = "Vocabulary", Category = "Lexical Knowledge", Description = "Understanding word meanings, contextual clues, and morphological roots", OrderIndex = 5 },
            new() { Name = "Comprehension", Category = "Reading Understanding", Description = "Extracting main ideas, answering inferential questions, and summarizing texts", OrderIndex = 6 }
        };
        await context.Skills.AddRangeAsync(skills);
        await context.SaveChangesAsync();

        // 2. Seed Achievements
        var achievements = new List<Achievement>
        {
            new() { Title = "First Reading Session", Description = "Completed your very first interactive reading session!", Icon = "BookOpen", BadgeType = "FirstSession", XpBonus = 50 },
            new() { Title = "10 Words Mastered", Description = "Successfully decoded and practiced 10 new vocabulary words!", Icon = "Sparkles", BadgeType = "WordsMastered10", XpBonus = 100 },
            new() { Title = "Phonics Explorer", Description = "Completed 5 phonics and sound-matching challenges!", Icon = "Headphones", BadgeType = "PhonicsExplorer", XpBonus = 150 },
            new() { Title = "7-Day Learning Streak", Description = "Practiced reading for 7 consecutive days without missing a beat!", Icon = "Flame", BadgeType = "Streak7", XpBonus = 200 },
            new() { Title = "Reading Champion", Description = "Mastered 3 reading passages with over 90% comprehension accuracy!", Icon = "Trophy", BadgeType = "ReadingChampion", XpBonus = 300 }
        };
        await context.Achievements.AddRangeAsync(achievements);
        await context.SaveChangesAsync();

        // 3. Seed Users
        var teacherUser = new User
        {
            FullName = "Sarah Jenkins, M.Ed.",
            Email = "teacher@lexicare.edu",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
            Role = UserRole.Teacher,
            AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
        };

        var parentUser = new User
        {
            FullName = "Priya Sharma",
            Email = "parent@lexicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Parent123!"),
            Role = UserRole.Parent,
            AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
        };

        var studentUser1 = new User
        {
            FullName = "Aarav Sharma",
            Email = "student@lexicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };

        var studentUser2 = new User
        {
            FullName = "Maya Patel",
            Email = "maya@lexicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            AvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
        };

        var studentUser3 = new User
        {
            FullName = "Leo Zhang",
            Email = "leo@lexicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            AvatarUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
        };

        var adminUser = new User
        {
            FullName = "System Administrator",
            Email = "admin@lexicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
        };

        await context.Users.AddRangeAsync(teacherUser, parentUser, studentUser1, studentUser2, studentUser3, adminUser);
        await context.SaveChangesAsync();

        // 4. Create Teacher and Parent Profiles
        var teacher = new Teacher
        {
            UserId = teacherUser.Id,
            SchoolName = "Oakridge Elementary School",
            Subject = "Grade 3 Lead Reading Specialist"
        };

        var parent = new Parent
        {
            UserId = parentUser.Id,
            PhoneNumber = "+1 (555) 392-8819"
        };

        await context.Teachers.AddAsync(teacher);
        await context.Parents.AddAsync(parent);
        await context.SaveChangesAsync();

        // 5. Create Students
        var student1 = new Student
        {
            UserId = studentUser1.Id,
            ParentId = parent.Id,
            GradeLevel = 3,
            Age = 8,
            PreferredTheme = "calm-teal",
            DyslexiaFontEnabled = true,
            TextSize = "large",
            CurrentStreak = 5,
            TotalXp = 480,
            Level = 3,
            LastActiveDate = DateTime.UtcNow
        };

        var student2 = new Student
        {
            UserId = studentUser2.Id,
            ParentId = parent.Id,
            GradeLevel = 3,
            Age = 8,
            PreferredTheme = "soft-purple",
            DyslexiaFontEnabled = true,
            TextSize = "medium",
            CurrentStreak = 3,
            TotalXp = 320,
            Level = 2,
            LastActiveDate = DateTime.UtcNow.AddDays(-1)
        };

        var student3 = new Student
        {
            UserId = studentUser3.Id,
            GradeLevel = 3,
            Age = 9,
            PreferredTheme = "warm-amber",
            DyslexiaFontEnabled = false,
            TextSize = "medium",
            CurrentStreak = 8,
            TotalXp = 820,
            Level = 5,
            LastActiveDate = DateTime.UtcNow
        };

        await context.Students.AddRangeAsync(student1, student2, student3);
        await context.SaveChangesAsync();

        // 6. Create Class and Enroll Students
        var readingClass = new Class
        {
            TeacherId = teacher.Id,
            Name = "Grade 3 - Reading Stars",
            GradeLevel = 3,
            AcademicYear = "2026-2027",
            Description = "Personalized reading development and phonological support group"
        };
        await context.Classes.AddAsync(readingClass);
        await context.SaveChangesAsync();

        var enrollments = new List<ClassStudent>
        {
            new() { ClassId = readingClass.Id, StudentId = student1.Id },
            new() { ClassId = readingClass.Id, StudentId = student2.Id },
            new() { ClassId = readingClass.Id, StudentId = student3.Id }
        };
        await context.ClassStudents.AddRangeAsync(enrollments);
        await context.SaveChangesAsync();

        // 7. Seed Student Skill Progress (matching the prompt scenario: Aarav Reading: 72%, Phonics: 61%, Spelling: 68%, Comprehension: 84%)
        var phonicsSkill = skills.First(s => s.Name == "Phonics");
        var readingSkill = skills.First(s => s.Name == "Reading");
        var spellingSkill = skills.First(s => s.Name == "Spelling");
        var wordRecSkill = skills.First(s => s.Name == "Word Recognition");
        var vocabSkill = skills.First(s => s.Name == "Vocabulary");
        var compSkill = skills.First(s => s.Name == "Comprehension");

        var aaravProgress = new List<StudentSkillProgress>
        {
            new() { StudentId = student1.Id, SkillId = readingSkill.Id, CurrentScore = 72, Level = "Developing", AccuracyRate = 72, TotalAttempts = 14, CommonErrorPatterns = "[\"sight_word_hesitation\"]" },
            new() { StudentId = student1.Id, SkillId = phonicsSkill.Id, CurrentScore = 61, Level = "Beginner", AccuracyRate = 61, TotalAttempts = 18, CommonErrorPatterns = "[\"phonetic_substitution\", \"vowel_digraph_confusion\"]" },
            new() { StudentId = student1.Id, SkillId = spellingSkill.Id, CurrentScore = 68, Level = "Developing", AccuracyRate = 68, TotalAttempts = 16, CommonErrorPatterns = "[\"phonetic_transcription_cat_kat\", \"silent_e_omission\"]" },
            new() { StudentId = student1.Id, SkillId = wordRecSkill.Id, CurrentScore = 64, Level = "Developing", AccuracyRate = 64, TotalAttempts = 22, CommonErrorPatterns = "[\"b_d_reversal\", \"p_q_confusion\"]" },
            new() { StudentId = student1.Id, SkillId = vocabSkill.Id, CurrentScore = 79, Level = "Proficient", AccuracyRate = 79, TotalAttempts = 12, CommonErrorPatterns = "[]" },
            new() { StudentId = student1.Id, SkillId = compSkill.Id, CurrentScore = 84, Level = "Proficient", AccuracyRate = 84, TotalAttempts = 10, CommonErrorPatterns = "[]" }
        };

        var mayaProgress = new List<StudentSkillProgress>
        {
            new() { StudentId = student2.Id, SkillId = readingSkill.Id, CurrentScore = 78, Level = "Developing", AccuracyRate = 78, TotalAttempts = 9, CommonErrorPatterns = "[]" },
            new() { StudentId = student2.Id, SkillId = phonicsSkill.Id, CurrentScore = 65, Level = "Developing", AccuracyRate = 65, TotalAttempts = 14, CommonErrorPatterns = "[\"rhyme_detection_delay\"]" },
            new() { StudentId = student2.Id, SkillId = spellingSkill.Id, CurrentScore = 74, Level = "Developing", AccuracyRate = 74, TotalAttempts = 11, CommonErrorPatterns = "[]" },
            new() { StudentId = student2.Id, SkillId = wordRecSkill.Id, CurrentScore = 80, Level = "Proficient", AccuracyRate = 80, TotalAttempts = 12, CommonErrorPatterns = "[]" },
            new() { StudentId = student2.Id, SkillId = vocabSkill.Id, CurrentScore = 85, Level = "Proficient", AccuracyRate = 85, TotalAttempts = 10, CommonErrorPatterns = "[]" },
            new() { StudentId = student2.Id, SkillId = compSkill.Id, CurrentScore = 81, Level = "Proficient", AccuracyRate = 81, TotalAttempts = 8, CommonErrorPatterns = "[]" }
        };

        var leoProgress = new List<StudentSkillProgress>
        {
            new() { StudentId = student3.Id, SkillId = readingSkill.Id, CurrentScore = 91, Level = "Mastered", AccuracyRate = 91, TotalAttempts = 20, CommonErrorPatterns = "[]" },
            new() { StudentId = student3.Id, SkillId = phonicsSkill.Id, CurrentScore = 88, Level = "Proficient", AccuracyRate = 88, TotalAttempts = 22, CommonErrorPatterns = "[]" },
            new() { StudentId = student3.Id, SkillId = spellingSkill.Id, CurrentScore = 89, Level = "Proficient", AccuracyRate = 89, TotalAttempts = 19, CommonErrorPatterns = "[]" },
            new() { StudentId = student3.Id, SkillId = wordRecSkill.Id, CurrentScore = 94, Level = "Mastered", AccuracyRate = 94, TotalAttempts = 18, CommonErrorPatterns = "[]" },
            new() { StudentId = student3.Id, SkillId = vocabSkill.Id, CurrentScore = 92, Level = "Mastered", AccuracyRate = 92, TotalAttempts = 16, CommonErrorPatterns = "[]" },
            new() { StudentId = student3.Id, SkillId = compSkill.Id, CurrentScore = 95, Level = "Mastered", AccuracyRate = 95, TotalAttempts = 15, CommonErrorPatterns = "[]" }
        };

        await context.StudentSkillProgresses.AddRangeAsync(aaravProgress);
        await context.StudentSkillProgresses.AddRangeAsync(mayaProgress);
        await context.StudentSkillProgresses.AddRangeAsync(leoProgress);
        await context.SaveChangesAsync();

        // 8. Seed Achievements for Aarav
        await context.StudentAchievements.AddRangeAsync(
            new StudentAchievement { StudentId = student1.Id, AchievementId = achievements[0].Id, EarnedAt = DateTime.UtcNow.AddDays(-6) },
            new StudentAchievement { StudentId = student1.Id, AchievementId = achievements[1].Id, EarnedAt = DateTime.UtcNow.AddDays(-2) }
        );
        await context.SaveChangesAsync();

        // 9. Seed Screening Questions (Comprehensive, age 7-10)
        var questions = new List<ScreeningQuestion>
        {
            // READING
            new()
            {
                Category = "Reading",
                SubCategory = "LetterDiscrimination_bd",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Look closely at this letter: 'b'. Which word begins with this exact letter sound?",
                AudioPromptText = "Find the word that begins with the letter b sound.",
                VisualCue = "b",
                OptionsJson = "[\"dog\", \"bat\", \"pot\", \"pig\"]",
                CorrectAnswer = "bat",
                DifficultyLevel = 1,
                Explanation = "The letter 'b' has its belly facing right: /b/ as in 'bat'.",
                ErrorPatternTag = "b_d_confusion"
            },
            new()
            {
                Category = "Reading",
                SubCategory = "LetterDiscrimination_bd",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Select the word that starts with the letter 'd':",
                AudioPromptText = "Which word starts with the letter d?",
                VisualCue = "d",
                OptionsJson = "[\"ball\", \"drum\", \"boat\", \"bear\"]",
                CorrectAnswer = "drum",
                DifficultyLevel = 1,
                Explanation = "'d' has its circle on the left with a tall stick on the right.",
                ErrorPatternTag = "b_d_confusion"
            },
            new()
            {
                Category = "Reading",
                SubCategory = "SightWordRecognition",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Which word correctly completes the sentence: 'The bird flew _____ the tall tree.'?",
                AudioPromptText = "Complete the sentence: The bird flew blank the tall tree.",
                OptionsJson = "[\"over\", \"oven\", \"ever\", \"other\"]",
                CorrectAnswer = "over",
                DifficultyLevel = 2,
                Explanation = "'Over' makes sense in this sentence and matches the visual sight word.",
                ErrorPatternTag = "sight_word_confusion"
            },
            new()
            {
                Category = "Reading",
                SubCategory = "MisspelledWordIdentification",
                TargetAgeMin = 7, TargetAgeMax = 11,
                QuestionText = "One of these words is NOT spelled correctly. Can you spot it?",
                AudioPromptText = "Which word is spelled incorrectly?",
                OptionsJson = "[\"friend\", \"skool\", \"bright\", \"cloud\"]",
                CorrectAnswer = "skool",
                DifficultyLevel = 2,
                Explanation = "'School' is spelled with 'sch', not 'sk'.",
                ErrorPatternTag = "orthographic_spelling_pattern"
            },

            // PHONICS
            new()
            {
                Category = "Phonics",
                SubCategory = "LetterSoundMatching",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Which letter makes the sound you hear at the start of 'Sun'?",
                AudioPromptText = "Listen to the word Sun. Which letter makes the /s/ sound?",
                VisualCue = "☀️",
                OptionsJson = "[\"C\", \"S\", \"Z\", \"F\"]",
                CorrectAnswer = "S",
                DifficultyLevel = 1,
                Explanation = "The letter 'S' makes the /s/ sound.",
                ErrorPatternTag = "phoneme_grapheme_matching"
            },
            new()
            {
                Category = "Phonics",
                SubCategory = "RhymingWords",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Which word rhymes with 'Light'?",
                AudioPromptText = "Find the word that rhymes with light.",
                VisualCue = "💡",
                OptionsJson = "[\"Late\", \"Night\", \"Little\", \"Lift\"]",
                CorrectAnswer = "Night",
                DifficultyLevel = 1,
                Explanation = "'Light' and 'Night' end with the same sound: /-ite/.",
                ErrorPatternTag = "rhyme_awareness"
            },
            new()
            {
                Category = "Phonics",
                SubCategory = "WordSegmentation",
                TargetAgeMin = 7, TargetAgeMax = 11,
                QuestionText = "How many distinct sounds (phonemes) do you hear in the word 'SHIP' (/sh/ - /i/ - /p/)?",
                AudioPromptText = "How many sounds are in the word ship?",
                OptionsJson = "[\"2 sounds\", \"3 sounds\", \"4 sounds\", \"5 sounds\"]",
                CorrectAnswer = "3 sounds",
                DifficultyLevel = 2,
                Explanation = "'Ship' has 4 letters but 3 sounds: /sh/, /i/, and /p/.",
                ErrorPatternTag = "phonemic_segmentation"
            },
            new()
            {
                Category = "Phonics",
                SubCategory = "VowelDigraphs",
                TargetAgeMin = 7, TargetAgeMax = 11,
                QuestionText = "Which word has the long 'A' sound like in 'Train'?",
                AudioPromptText = "Which word has the long A sound?",
                OptionsJson = "[\"Rain\", \"Ran\", \"Tan\", \"Trap\"]",
                CorrectAnswer = "Rain",
                DifficultyLevel = 2,
                Explanation = "The 'ai' digraph in 'Rain' creates the long /a/ vowel sound.",
                ErrorPatternTag = "vowel_digraph_confusion"
            },

            // SPELLING
            new()
            {
                Category = "Spelling",
                SubCategory = "PhoneticSubstitution",
                TargetAgeMin = 6, TargetAgeMax = 10,
                QuestionText = "Select the correct spelling of the pet animal that meows:",
                AudioPromptText = "Select the correct spelling for cat.",
                VisualCue = "🐱",
                OptionsJson = "[\"kat\", \"cat\", \"catt\", \"cet\"]",
                CorrectAnswer = "cat",
                DifficultyLevel = 1,
                Explanation = "Although 'k' makes the /k/ sound, standard English spells it 'cat'.",
                ErrorPatternTag = "phonetic_substitution"
            },
            new()
            {
                Category = "Spelling",
                SubCategory = "SilentEPattern",
                TargetAgeMin = 7, TargetAgeMax = 11,
                QuestionText = "Which spelling correctly turns 'hop' into the word for jump on one foot to moving fast like a 'hope' or 'hopeful' feeling?",
                AudioPromptText = "Which word uses the silent e to make the vowel say its name in hope?",
                OptionsJson = "[\"hopp\", \"hope\", \"hpoe\", \"hop\"]",
                CorrectAnswer = "hope",
                DifficultyLevel = 2,
                Explanation = "The silent 'e' at the end changes the short /o/ in 'hop' to the long /o/ in 'hope'.",
                ErrorPatternTag = "silent_e_omission"
            },
            new()
            {
                Category = "Spelling",
                SubCategory = "DoubleConsonants",
                TargetAgeMin = 7, TargetAgeMax = 11,
                QuestionText = "Select the correct spelling:",
                AudioPromptText = "Choose the correct spelling of rabbit.",
                VisualCue = "🐇",
                OptionsJson = "[\"rabit\", \"rabbit\", \"rabitt\", \"rabbet\"]",
                CorrectAnswer = "rabbit",
                DifficultyLevel = 2,
                Explanation = "'Rabbit' has a double 'bb' after the short vowel.",
                ErrorPatternTag = "consonant_doubling"
            },

            // COMPREHENSION
            new()
            {
                Category = "Comprehension",
                SubCategory = "MainIdea",
                TargetAgeMin = 7, TargetAgeMax = 12,
                QuestionText = "Read this passage:\n\n'Bella the squirrel gathered twelve acorns before sunset. She carefully buried four under the big oak tree and eight under the stone wall. Now she is ready for the cold winter ahead.'\n\nWhat is the main idea of this passage?",
                AudioPromptText = "What is the main idea of the story about Bella the squirrel?",
                OptionsJson = "[\"Bella is preparing for winter by storing food.\", \"Bella lost her acorns in the forest.\", \"The stone wall is older than the oak tree.\", \"Squirrels do not like winter weather.\"]",
                CorrectAnswer = "Bella is preparing for winter by storing food.",
                DifficultyLevel = 2,
                Explanation = "The whole story describes Bella gathering and storing acorns to prepare for winter.",
                ErrorPatternTag = "main_idea_extraction"
            },
            new()
            {
                Category = "Comprehension",
                SubCategory = "FactualRecall",
                TargetAgeMin = 7, TargetAgeMax = 12,
                QuestionText = "Based on the story above, how many acorns did Bella bury under the oak tree?",
                AudioPromptText = "How many acorns did Bella bury under the oak tree?",
                OptionsJson = "[\"Twelve\", \"Four\", \"Eight\", \"None\"]",
                CorrectAnswer = "Four",
                DifficultyLevel = 1,
                Explanation = "The text specifically mentions: 'She carefully buried four under the big oak tree'.",
                ErrorPatternTag = "detail_retrieval"
            }
        };

        await context.ScreeningQuestions.AddRangeAsync(questions);
        await context.SaveChangesAsync();

        // 10. Seed Learning Activities
        var activities = new List<LearningActivity>
        {
            new()
            {
                SkillId = wordRecSkill.Id,
                Title = "B vs D Detective",
                Description = "Train your eyes to spot the difference between 'b' and 'd' with visual anchors and fun cues!",
                Type = "LetterDiscrimination",
                DifficultyLevel = 1,
                EstimatedMinutes = 5,
                XpReward = 60,
                ContentJson = "{\"anchorTip\":\"Remember: 'b' has a belly in front (walks forward), 'd' has a diaper behind (backs up)!\",\"pairs\":[{\"target\":\"b\",\"distractor\":\"d\",\"cue\":\"b in bat\",\"correct\":\"b\"},{\"target\":\"d\",\"distractor\":\"b\",\"cue\":\"d in dog\",\"correct\":\"d\"},{\"target\":\"b\",\"distractor\":\"d\",\"cue\":\"b in ball\",\"correct\":\"b\"},{\"target\":\"d\",\"distractor\":\"b\",\"cue\":\"d in duck\",\"correct\":\"d\"}]}"
            },
            new()
            {
                SkillId = phonicsSkill.Id,
                Title = "Sound to Letter Builder",
                Description = "Listen to phonemes and tap letters to build 3-letter words like cat, pin, and sun.",
                Type = "WordBuilding",
                DifficultyLevel = 1,
                EstimatedMinutes = 6,
                XpReward = 75,
                ContentJson = "{\"words\":[{\"target\":\"cat\",\"audioPrompt\":\"/k/ /a/ /t/\",\"hint\":\"A friendly feline\",\"scramble\":[\"t\",\"a\",\"c\",\"k\"]},{\"target\":\"pin\",\"audioPrompt\":\"/p/ /i/ /n/\",\"hint\":\"Sharp small tool\",\"scramble\":[\"i\",\"p\",\"n\",\"b\"]},{\"target\":\"sun\",\"audioPrompt\":\"/s/ /u/ /n/\",\"hint\":\"Shines brightly in the sky\",\"scramble\":[\"u\",\"n\",\"s\",\"c\"]}]}"
            },
            new()
            {
                SkillId = spellingSkill.Id,
                Title = "Spelling Power: C vs K",
                Description = "Master the rule: C goes with a, o, u; K takes e and i (like kitten and cat)!",
                Type = "SpellingQuiz",
                DifficultyLevel = 2,
                EstimatedMinutes = 7,
                XpReward = 80,
                ContentJson = "{\"rule\":\"Use 'k' before 'e' or 'i' (kitten, kite). Use 'c' before 'a', 'o', 'u' (cat, cot, cup).\",\"questions\":[{\"prompt\":\"___ite (flying toy)\",\"options\":[\"K\",\"C\"],\"correct\":\"K\"},{\"prompt\":\"___at (purring pet)\",\"options\":[\"C\",\"K\"],\"correct\":\"C\"},{\"prompt\":\"___itten (young cat)\",\"options\":[\"K\",\"C\"],\"correct\":\"K\"},{\"prompt\":\"___up (drink container)\",\"options\":[\"C\",\"K\"],\"correct\":\"C\"}]}"
            },
            new()
            {
                SkillId = readingSkill.Id,
                Title = "Sentence Flow & Fluency",
                Description = "Practice reading short rhythmic sentences with highlighted word tracking.",
                Type = "GuidedReading",
                DifficultyLevel = 2,
                EstimatedMinutes = 8,
                XpReward = 90,
                ContentJson = "{\"sentences\":[\"The red fox ran up the green hill.\",\"A big brown dog jumped in the cool lake.\",\"Sam saw five blue birds in the morning sky.\"]}"
            },
            new()
            {
                SkillId = compSkill.Id,
                Title = "The Secret Treehouse Adventure",
                Description = "Read an exciting short tale and discover the mystery inside the treehouse!",
                Type = "ComprehensionQuiz",
                DifficultyLevel = 2,
                EstimatedMinutes = 10,
                XpReward = 100,
                ContentJson = "{\"passage\":\"Toby found a wooden ladder behind the willow tree. At the top was a cozy treehouse with glass windows and a telescope. Looking through the lens, he saw a hidden waterfall glittering in the sun.\",\"questions\":[{\"q\":\"Where did Toby find the wooden ladder?\",\"options\":[\"Behind the willow tree\",\"Under the porch\",\"Inside the barn\"],\"answer\":\"Behind the willow tree\"},{\"q\":\"What did Toby see through the telescope?\",\"options\":[\"A hidden waterfall\",\"A bird nest\",\"A mountain peak\"],\"answer\":\"A hidden waterfall\"}]}"
            }
        };

        await context.LearningActivities.AddRangeAsync(activities);
        await context.SaveChangesAsync();

        // 11. Seed Reading Materials for Reading Assistant
        var readingMaterials = new List<ReadingMaterial>
        {
            new()
            {
                Title = "The Curious River Otter",
                GradeLevel = 3,
                Category = "Nature & Wildlife",
                LexileLevel = "450L",
                WordCount = 85,
                ContentText = "Oliver is a lively river otter who lives along the quiet banks of Willow Creek. Every morning, he slides down the muddy slope into the cool, sparkling water. Oliver loves chasing silvery minnows between smooth river stones. After a busy swim, he curls up on a sunny rock to dry his warm, waterproof fur and watch the dragonflies dance.",
                AudioNarrationText = "Oliver is a lively river otter who lives along the quiet banks of Willow Creek. Every morning, he slides down the muddy slope into the cool, sparkling water. Oliver loves chasing silvery minnows between smooth river stones. After a busy swim, he curls up on a sunny rock to dry his warm, waterproof fur and watch the dragonflies dance.",
                SyllableBreakdownJson = "{\"Oliver\":\"Ol-i-ver\",\"lively\":\"live-ly\",\"sparkling\":\"spar-kling\",\"minnows\":\"min-nows\",\"waterproof\":\"wa-ter-proof\",\"dragonflies\":\"drag-on-flies\"}",
                ComprehensionQuestionsJson = "[{\"question\":\"Where does Oliver live?\",\"options\":[\"Willow Creek\",\"Pine Mountain\",\"Sunny Bay\"],\"answer\":\"Willow Creek\"},{\"question\":\"What does Oliver do after swimming?\",\"options\":[\"Curls up on a sunny rock\",\"Climbs a tall tree\",\"Hides underground\"],\"answer\":\"Curls up on a sunny rock\"}]"
            },
            new()
            {
                Title = "The Boy Who Built a Rocket Kite",
                GradeLevel = 3,
                Category = "Invention & Science",
                LexileLevel = "480L",
                WordCount = 92,
                ContentText = "Kiran loved anything that could fly. One breezy Saturday, he gathered thin bamboo sticks, bright orange tissue paper, and strong spool thread. With steady hands, he fashioned a kite shaped like a space shuttle. When a swift gust of wind caught the wings, Kiran's rocket kite soared high into the cloudless blue sky, trailing two silver ribbons that fluttered like comet tails.",
                AudioNarrationText = "Kiran loved anything that could fly. One breezy Saturday, he gathered thin bamboo sticks, bright orange tissue paper, and strong spool thread. With steady hands, he fashioned a kite shaped like a space shuttle. When a swift gust of wind caught the wings, Kiran's rocket kite soared high into the cloudless blue sky, trailing two silver ribbons that fluttered like comet tails.",
                SyllableBreakdownJson = "{\"bamboo\":\"bam-boo\",\"fashioned\":\"fash-ioned\",\"cloudless\":\"cloud-less\",\"shuttle\":\"shut-tle\",\"fluttered\":\"flut-tered\"}",
                ComprehensionQuestionsJson = "[{\"question\":\"What shape was Kiran's kite?\",\"options\":[\"A space shuttle\",\"A bird\",\"A diamond\"],\"answer\":\"A space shuttle\"},{\"question\":\"What trailed behind the kite?\",\"options\":[\"Two silver ribbons\",\"A long bell\",\"A yellow streamer\"],\"answer\":\"Two silver ribbons\"}]"
            },
            new()
            {
                Title = "The Mystery of the Whispering Cave",
                GradeLevel = 4,
                Category = "Adventure",
                LexileLevel = "520L",
                WordCount = 98,
                ContentText = "High on the rocky cliff above the village lay the Whispering Cave. Whenever the evening breeze drifted in from the ocean, deep musical notes echoed through the stone opening. Leo and his golden retriever, Rusty, decided to investigate. Armed with a reliable brass lantern, they discovered that wind blowing through narrow limestone hollows acted just like an enormous natural flute.",
                AudioNarrationText = "High on the rocky cliff above the village lay the Whispering Cave. Whenever the evening breeze drifted in from the ocean, deep musical notes echoed through the stone opening. Leo and his golden retriever, Rusty, decided to investigate. Armed with a reliable brass lantern, they discovered that wind blowing through narrow limestone hollows acted just like an enormous natural flute.",
                SyllableBreakdownJson = "{\"investigate\":\"in-ves-ti-gate\",\"reliable\":\"re-li-a-ble\",\"limestone\":\"lime-stone\",\"enormous\":\"e-nor-mous\"}",
                ComprehensionQuestionsJson = "[{\"question\":\"What made the whispering sound in the cave?\",\"options\":[\"Wind through limestone hollows\",\"A hidden animal\",\"An underground waterfall\"],\"answer\":\"Wind through limestone hollows\"}]"
            }
        };

        await context.ReadingMaterials.AddRangeAsync(readingMaterials);
        await context.SaveChangesAsync();

        // 12. Seed Sample Screening Session for Aarav
        var session = new ScreeningSession
        {
            StudentId = student1.Id,
            StartTime = DateTime.UtcNow.AddDays(-3).AddMinutes(-20),
            CompletedTime = DateTime.UtcNow.AddDays(-3),
            TotalQuestions = 12,
            CorrectAnswers = 8,
            AccuracyRate = 66.7,
            AverageResponseTimeMs = 3850,
            DifficultySummary = "Some areas may benefit from additional practice",
            ObservationsSummary = "Student shows strong receptive comprehension (84%) and vocabulary. Hesitations and substitutions observed on visual letter discrimination (b/d) and orthographic spelling patterns (cat -> kat). Phonics letter-sound decoding benefits from multi-sensory reinforcement.",
            DisclaimerConfirmed = true,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };
        await context.ScreeningSessions.AddAsync(session);
        await context.SaveChangesAsync();

        // 13. Seed AI Recommendation for Aarav
        var recommendation = new AIRecommendation
        {
            StudentId = student1.Id,
            GeneratedBy = "AI Educational Engine (Orton-Gillingham Informed)",
            FocusSkill = "Phonics + Visual Discrimination",
            IssueIdentified = "Letter discrimination hesitation between 'b' and 'd', phonetic substitution in spelling",
            RecommendationText = "Implement visual-tactile discrimination anchors for 'b' and 'd' (e.g. bed trick, hand grip cues). Introduce word-building games focusing on CVC patterns and consonant sound rules.",
            ParentExplanation = "Aarav understands stories very well! He is confusing letters that look alike (like b and d) and sounding out words exactly as they hear (writing kat for cat). With fun 5-minute tactile games at home, these patterns will strengthen quickly.",
            TeacherExplanation = "Student demonstrates strong listening comprehension and context analysis. Prioritize structured literacy intervention focusing on grapheme-phoneme mapping, Orton-Gillingham visual anchors for reversible letters, and spelling rule practice.",
            RecommendedActivitiesJson = "[\"B vs D Detective\", \"Sound to Letter Builder\", \"Spelling Power: C vs K\"]",
            SeverityLevel = "Moderate",
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };
        await context.AIRecommendations.AddAsync(recommendation);

        // 14. Seed Learning Plan for Aarav
        var plan = new LearningPlan
        {
            StudentId = student1.Id,
            CreatedByUserId = teacherUser.Id,
            Title = "Aarav's Phonics & Letter Recognition Focus Plan",
            Description = "Targeted 4-week structured support to strengthen letter discrimination (b/d) and spelling conventions.",
            RecommendedFocusSkills = "Phonics, Word Recognition, Spelling",
            WeeklyGoalMinutes = 60,
            Status = "Active",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow
        };
        await context.LearningPlans.AddAsync(plan);

        // 15. Seed Assignment
        var assignment = new Assignment
        {
            ClassId = readingClass.Id,
            TeacherId = teacher.Id,
            StudentId = student1.Id,
            ActivityId = activities[0].Id,
            Title = "Weekly Focus: B vs D Letter Detective",
            Instructions = "Complete 5 rounds of letter discrimination before Friday.",
            DueDate = DateTime.UtcNow.AddDays(4),
            IsCompleted = false
        };
        await context.Assignments.AddAsync(assignment);

        // 16. Seed Notifications
        var notification = new Notification
        {
            UserId = parentUser.Id,
            Title = "New Educational Observation Available",
            Message = "Aarav completed a reading screening session. Focus recommendation: Phonics and letter discrimination.",
            Type = "Recommendation",
            IsRead = false,
            ActionUrl = "/parent"
        };
        await context.Notifications.AddAsync(notification);

        // 17. Seed Progress Report for Aarav
        var report = new ProgressReport
        {
            StudentId = student1.Id,
            GeneratedByUserId = teacherUser.Id,
            ReportDate = DateTime.UtcNow.AddDays(-1),
            PeriodStart = DateTime.UtcNow.AddDays(-30),
            PeriodEnd = DateTime.UtcNow,
            OverallSummary = "Aarav has shown enthusiastic engagement during reading sessions. His auditory comprehension and story recall remain in the top quartile (84%). Key developmental focus areas include visual letter discrimination and phoneme-to-grapheme spelling correspondence.",
            SkillBreakdownJson = "{\"Phonics\":61,\"Reading\":72,\"Spelling\":68,\"Word Recognition\":64,\"Vocabulary\":79,\"Comprehension\":84}",
            CommonErrorsSummary = "1. Reversible letter confusion (b/d)\n2. Phonetic spellings (e.g., 'kat' instead of 'cat')\n3. Mild hesitation on unfamiliar multi-syllable sight words",
            RecommendedActionPlan = "1. Daily 5-minute visual discrimination drills (B vs D Detective).\n2. Tactile letter tracing in sand or kinetic foam.\n3. Guided audio-assisted reading with syllable highlighting in the LexiCare Reading Assistant.\n4. Celebrate steady progress to keep confidence soaring!",
            DisclaimerText = "This report provides educational observations and does not constitute a medical diagnosis."
        };
        await context.ProgressReports.AddAsync(report);

        await context.SaveChangesAsync();
    }
}
