import {
  User,
  StudentProfile,
  StudentSkillProgress,
  Achievement,
  ScreeningQuestion,
  ScreeningResult,
  LearningActivity,
  AdaptiveFeedback,
  ReadingMaterial,
  AssignmentItem,
  ProgressReport
} from '../types';

export const mockUsers: Record<string, { user: User; token: string }> = {
  'student@lexicare.com': {
    token: 'mock-jwt-token-student-aarav',
    user: {
      id: 3,
      fullName: 'Aarav Sharma',
      email: 'student@lexicare.com',
      role: 'Student',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      studentId: 1,
    }
  },
  'teacher@lexicare.edu': {
    token: 'mock-jwt-token-teacher-sarah',
    user: {
      id: 1,
      fullName: 'Sarah Jenkins, M.Ed.',
      email: 'teacher@lexicare.edu',
      role: 'Teacher',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      teacherId: 1,
    }
  },
  'parent@lexicare.com': {
    token: 'mock-jwt-token-parent-priya',
    user: {
      id: 2,
      fullName: 'Priya Sharma',
      email: 'parent@lexicare.com',
      role: 'Parent',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      parentId: 1,
    }
  },
  'admin@lexicare.com': {
    token: 'mock-jwt-token-admin',
    user: {
      id: 4,
      fullName: 'System Administrator',
      email: 'admin@lexicare.com',
      role: 'Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    }
  }
};

export const mockSkills: StudentSkillProgress[] = [
  {
    skillId: 1,
    skillName: 'Phonics',
    category: 'Phonological Awareness',
    currentScore: 61,
    level: 'Beginner',
    accuracyRate: 61,
    totalAttempts: 18,
    lastPracticedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    commonErrorPatterns: ['phonetic_substitution', 'vowel_digraph_confusion']
  },
  {
    skillId: 2,
    skillName: 'Reading',
    category: 'Fluency & Decoding',
    currentScore: 72,
    level: 'Developing',
    accuracyRate: 72,
    totalAttempts: 14,
    lastPracticedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    commonErrorPatterns: ['sight_word_hesitation']
  },
  {
    skillId: 3,
    skillName: 'Spelling',
    category: 'Orthographic Processing',
    currentScore: 68,
    level: 'Developing',
    accuracyRate: 68,
    totalAttempts: 16,
    lastPracticedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    commonErrorPatterns: ['phonetic_transcription_cat_kat', 'silent_e_omission']
  },
  {
    skillId: 4,
    skillName: 'Word Recognition',
    category: 'Visual Processing',
    currentScore: 64,
    level: 'Developing',
    accuracyRate: 64,
    totalAttempts: 22,
    lastPracticedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    commonErrorPatterns: ['b_d_reversal', 'p_q_confusion']
  },
  {
    skillId: 5,
    skillName: 'Vocabulary',
    category: 'Lexical Knowledge',
    currentScore: 79,
    level: 'Proficient',
    accuracyRate: 79,
    totalAttempts: 12,
    lastPracticedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    commonErrorPatterns: []
  },
  {
    skillId: 6,
    skillName: 'Comprehension',
    category: 'Reading Understanding',
    currentScore: 84,
    level: 'Proficient',
    accuracyRate: 84,
    totalAttempts: 10,
    lastPracticedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    commonErrorPatterns: []
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'First Reading Session',
    description: 'Completed your very first interactive reading session!',
    icon: 'BookOpen',
    badgeType: 'FirstSession',
    xpBonus: 50,
    earnedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 2,
    title: '10 Words Mastered',
    description: 'Successfully decoded and practiced 10 new vocabulary words!',
    icon: 'Sparkles',
    badgeType: 'WordsMastered10',
    xpBonus: 100,
    earnedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 3,
    title: 'Phonics Explorer',
    description: 'Completed 5 phonics and sound-matching challenges!',
    icon: 'Headphones',
    badgeType: 'PhonicsExplorer',
    xpBonus: 150,
    earnedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

export const mockStudentProfile: StudentProfile = {
  id: 1,
  userId: 3,
  fullName: 'Aarav Sharma',
  email: 'student@lexicare.com',
  gradeLevel: 3,
  age: 8,
  preferredTheme: 'calm-teal',
  dyslexiaFontEnabled: true,
  textSize: 'large',
  currentStreak: 5,
  totalXp: 480,
  level: 3,
  skills: mockSkills,
  achievements: mockAchievements
};

export const mockScreeningQuestions: (ScreeningQuestion & { correctAnswer: string; errorPatternTag: string })[] = [
  {
    id: 1,
    category: 'Reading',
    subCategory: 'LetterDiscrimination_bd',
    questionText: "Look closely at this letter: 'b'. Which word begins with this exact letter sound?",
    audioPromptText: 'Find the word that begins with the letter b sound.',
    visualCue: 'b',
    options: ['dog', 'bat', 'pot', 'pig'],
    correctAnswer: 'bat',
    difficultyLevel: 1,
    explanation: "The letter 'b' has its belly facing right: /b/ as in 'bat'.",
    errorPatternTag: 'b_d_confusion'
  },
  {
    id: 2,
    category: 'Reading',
    subCategory: 'LetterDiscrimination_bd',
    questionText: "Select the word that starts with the letter 'd':",
    audioPromptText: 'Which word starts with the letter d?',
    visualCue: 'd',
    options: ['ball', 'drum', 'boat', 'bear'],
    correctAnswer: 'drum',
    difficultyLevel: 1,
    explanation: "'d' has its circle on the left with a tall stick on the right.",
    errorPatternTag: 'b_d_confusion'
  },
  {
    id: 3,
    category: 'Reading',
    subCategory: 'SightWordRecognition',
    questionText: "Which word correctly completes the sentence: 'The bird flew _____ the tall tree.'?",
    audioPromptText: 'Complete the sentence: The bird flew blank the tall tree.',
    options: ['over', 'oven', 'ever', 'other'],
    correctAnswer: 'over',
    difficultyLevel: 2,
    explanation: "'Over' makes sense in this sentence and matches the visual sight word.",
    errorPatternTag: 'sight_word_confusion'
  },
  {
    id: 4,
    category: 'Reading',
    subCategory: 'MisspelledWordIdentification',
    questionText: 'One of these words is NOT spelled correctly. Can you spot it?',
    audioPromptText: 'Which word is spelled incorrectly?',
    options: ['friend', 'skool', 'bright', 'cloud'],
    correctAnswer: 'skool',
    difficultyLevel: 2,
    explanation: "'School' is spelled with 'sch', not 'sk'.",
    errorPatternTag: 'orthographic_spelling_pattern'
  },
  {
    id: 5,
    category: 'Phonics',
    subCategory: 'LetterSoundMatching',
    questionText: "Which letter makes the sound you hear at the start of 'Sun'?",
    audioPromptText: 'Listen to the word Sun. Which letter makes the /s/ sound?',
    visualCue: '☀️',
    options: ['C', 'S', 'Z', 'F'],
    correctAnswer: 'S',
    difficultyLevel: 1,
    explanation: "The letter 'S' makes the /s/ sound.",
    errorPatternTag: 'phoneme_grapheme_matching'
  },
  {
    id: 6,
    category: 'Phonics',
    subCategory: 'RhymingWords',
    questionText: "Which word rhymes with 'Light'?",
    audioPromptText: 'Find the word that rhymes with light.',
    visualCue: '💡',
    options: ['Late', 'Night', 'Little', 'Lift'],
    correctAnswer: 'Night',
    difficultyLevel: 1,
    explanation: "'Light' and 'Night' end with the same sound: /-ite/.",
    errorPatternTag: 'rhyme_awareness'
  },
  {
    id: 7,
    category: 'Phonics',
    subCategory: 'WordSegmentation',
    questionText: "How many distinct sounds (phonemes) do you hear in the word 'SHIP' (/sh/ - /i/ - /p/)?",
    audioPromptText: 'How many sounds are in the word ship?',
    options: ['2 sounds', '3 sounds', '4 sounds', '5 sounds'],
    correctAnswer: '3 sounds',
    difficultyLevel: 2,
    explanation: "'Ship' has 4 letters but 3 sounds: /sh/, /i/, and /p/.",
    errorPatternTag: 'phonemic_segmentation'
  },
  {
    id: 8,
    category: 'Phonics',
    subCategory: 'VowelDigraphs',
    questionText: "Which word has the long 'A' sound like in 'Train'?",
    audioPromptText: 'Which word has the long A sound?',
    options: ['Rain', 'Ran', 'Tan', 'Trap'],
    correctAnswer: 'Rain',
    difficultyLevel: 2,
    explanation: "The 'ai' digraph in 'Rain' creates the long /a/ vowel sound.",
    errorPatternTag: 'vowel_digraph_confusion'
  },
  {
    id: 9,
    category: 'Spelling',
    subCategory: 'PhoneticSubstitution',
    questionText: 'Select the correct spelling of the pet animal that meows:',
    audioPromptText: 'Select the correct spelling for cat.',
    visualCue: '🐱',
    options: ['kat', 'cat', 'catt', 'cet'],
    correctAnswer: 'cat',
    difficultyLevel: 1,
    explanation: "Although 'k' makes the /k/ sound, standard English spells it 'cat'.",
    errorPatternTag: 'phonetic_substitution'
  },
  {
    id: 10,
    category: 'Spelling',
    subCategory: 'SilentEPattern',
    questionText: "Which spelling correctly turns 'hop' into the word for a hopeful feeling?",
    audioPromptText: 'Which word uses the silent e to make the vowel say its name in hope?',
    options: ['hopp', 'hope', 'hpoe', 'hop'],
    correctAnswer: 'hope',
    difficultyLevel: 2,
    explanation: "The silent 'e' at the end changes the short /o/ in 'hop' to the long /o/ in 'hope'.",
    errorPatternTag: 'silent_e_omission'
  },
  {
    id: 11,
    category: 'Comprehension',
    subCategory: 'MainIdea',
    questionText: "Read this passage:\n\n'Bella the squirrel gathered twelve acorns before sunset. She carefully buried four under the big oak tree and eight under the stone wall. Now she is ready for the cold winter ahead.'\n\nWhat is the main idea of this passage?",
    audioPromptText: 'What is the main idea of the story about Bella the squirrel?',
    options: [
      'Bella is preparing for winter by storing food.',
      'Bella lost her acorns in the forest.',
      'The stone wall is older than the oak tree.',
      'Squirrels do not like winter weather.'
    ],
    correctAnswer: 'Bella is preparing for winter by storing food.',
    difficultyLevel: 2,
    explanation: 'The whole story describes Bella gathering and storing acorns to prepare for winter.',
    errorPatternTag: 'main_idea_extraction'
  }
];

export const mockActivities: LearningActivity[] = [
  {
    id: 1,
    skillId: 4,
    skillName: 'Word Recognition',
    title: 'B vs D Detective',
    description: "Train your eyes to spot the difference between 'b' and 'd' with visual anchors and fun cues!",
    type: 'LetterDiscrimination',
    difficultyLevel: 1,
    estimatedMinutes: 5,
    xpReward: 60,
    contentJson: JSON.stringify({
      anchorTip: "Remember: 'b' has a belly in front (walks forward), 'd' has a diaper behind (backs up)!",
      pairs: [
        { target: 'b', distractor: 'd', cue: 'b in bat', correct: 'b' },
        { target: 'd', distractor: 'b', cue: 'd in dog', correct: 'd' },
        { target: 'b', distractor: 'd', cue: 'b in ball', correct: 'b' },
        { target: 'd', distractor: 'b', cue: 'd in duck', correct: 'd' }
      ]
    })
  },
  {
    id: 2,
    skillId: 1,
    skillName: 'Phonics',
    title: 'Sound to Letter Builder',
    description: 'Listen to phonemes and tap letters to build 3-letter words like cat, pin, and sun.',
    type: 'WordBuilding',
    difficultyLevel: 1,
    estimatedMinutes: 6,
    xpReward: 75,
    contentJson: JSON.stringify({
      words: [
        { target: 'cat', audioPrompt: '/k/ /a/ /t/', hint: 'A friendly feline', scramble: ['t', 'a', 'c', 'k'] },
        { target: 'pin', audioPrompt: '/p/ /i/ /n/', hint: 'Sharp small tool', scramble: ['i', 'p', 'n', 'b'] },
        { target: 'sun', audioPrompt: '/s/ /u/ /n/', hint: 'Shines brightly in the sky', scramble: ['u', 'n', 's', 'c'] }
      ]
    })
  },
  {
    id: 3,
    skillId: 3,
    skillName: 'Spelling',
    title: 'Spelling Power: C vs K',
    description: 'Master the rule: C goes with a, o, u; K takes e and i (like kitten and cat)!',
    type: 'SpellingQuiz',
    difficultyLevel: 2,
    estimatedMinutes: 7,
    xpReward: 80,
    contentJson: JSON.stringify({
      rule: "Use 'k' before 'e' or 'i' (kitten, kite). Use 'c' before 'a', 'o', 'u' (cat, cot, cup).",
      questions: [
        { prompt: '___ite (flying toy)', options: ['K', 'C'], correct: 'K' },
        { prompt: '___at (purring pet)', options: ['C', 'K'], correct: 'C' },
        { prompt: '___itten (young cat)', options: ['K', 'C'], correct: 'K' },
        { prompt: '___up (drink container)', options: ['C', 'K'], correct: 'C' }
      ]
    })
  },
  {
    id: 4,
    skillId: 2,
    skillName: 'Reading',
    title: 'Sentence Flow & Fluency',
    description: 'Practice reading short rhythmic sentences with highlighted word tracking.',
    type: 'GuidedReading',
    difficultyLevel: 2,
    estimatedMinutes: 8,
    xpReward: 90,
    contentJson: JSON.stringify({
      sentences: [
        'The red fox ran up the green hill.',
        'A big brown dog jumped in the cool lake.',
        'Sam saw five blue birds in the morning sky.'
      ]
    })
  },
  {
    id: 5,
    skillId: 6,
    skillName: 'Comprehension',
    title: 'The Secret Treehouse Adventure',
    description: 'Read an exciting short tale and discover the mystery inside the treehouse!',
    type: 'ComprehensionQuiz',
    difficultyLevel: 2,
    estimatedMinutes: 10,
    xpReward: 100,
    contentJson: JSON.stringify({
      passage: 'Toby found a wooden ladder behind the willow tree. At the top was a cozy treehouse with glass windows and a telescope. Looking through the lens, he saw a hidden waterfall glittering in the sun.',
      questions: [
        { q: 'Where did Toby find the wooden ladder?', options: ['Behind the willow tree', 'Under the porch', 'Inside the barn'], answer: 'Behind the willow tree' },
        { q: 'What did Toby see through the telescope?', options: ['A hidden waterfall', 'A bird nest', 'A mountain peak'], answer: 'A hidden waterfall' }
      ]
    })
  }
];

export const mockReadingMaterials: ReadingMaterial[] = [
  {
    id: 1,
    title: 'The Curious River Otter',
    gradeLevel: 3,
    category: 'Nature & Wildlife',
    lexileLevel: '450L',
    wordCount: 85,
    contentText: 'Oliver is a lively river otter who lives along the quiet banks of Willow Creek. Every morning, he slides down the muddy slope into the cool, sparkling water. Oliver loves chasing silvery minnows between smooth river stones. After a busy swim, he curls up on a sunny rock to dry his warm, waterproof fur and watch the dragonflies dance.',
    audioNarrationText: 'Oliver is a lively river otter who lives along the quiet banks of Willow Creek. Every morning, he slides down the muddy slope into the cool, sparkling water. Oliver loves chasing silvery minnows between smooth river stones. After a busy swim, he curls up on a sunny rock to dry his warm, waterproof fur and watch the dragonflies dance.',
    syllableBreakdown: {
      Oliver: 'Ol-i-ver',
      lively: 'live-ly',
      sparkling: 'spar-kling',
      minnows: 'min-nows',
      waterproof: 'wa-ter-proof',
      dragonflies: 'drag-on-flies'
    },
    comprehensionQuestions: [
      {
        question: 'Where does Oliver live?',
        options: ['Willow Creek', 'Pine Mountain', 'Sunny Bay'],
        answer: 'Willow Creek'
      },
      {
        question: 'What does Oliver do after swimming?',
        options: ['Curls up on a sunny rock', 'Climbs a tall tree', 'Hides underground'],
        answer: 'Curls up on a sunny rock'
      }
    ]
  },
  {
    id: 2,
    title: 'The Boy Who Built a Rocket Kite',
    gradeLevel: 3,
    category: 'Invention & Science',
    lexileLevel: '480L',
    wordCount: 92,
    contentText: "Kiran loved anything that could fly. One breezy Saturday, he gathered thin bamboo sticks, bright orange tissue paper, and strong spool thread. With steady hands, he fashioned a kite shaped like a space shuttle. When a swift gust of wind caught the wings, Kiran's rocket kite soared high into the cloudless blue sky, trailing two silver ribbons that fluttered like comet tails.",
    audioNarrationText: "Kiran loved anything that could fly. One breezy Saturday, he gathered thin bamboo sticks, bright orange tissue paper, and strong spool thread. With steady hands, he fashioned a kite shaped like a space shuttle. When a swift gust of wind caught the wings, Kiran's rocket kite soared high into the cloudless blue sky, trailing two silver ribbons that fluttered like comet tails.",
    syllableBreakdown: {
      bamboo: 'bam-boo',
      fashioned: 'fash-ioned',
      cloudless: 'cloud-less',
      shuttle: 'shut-tle',
      fluttered: 'flut-tered'
    },
    comprehensionQuestions: [
      {
        question: "What shape was Kiran's kite?",
        options: ['A space shuttle', 'A bird', 'A diamond'],
        answer: 'A space shuttle'
      },
      {
        question: 'What trailed behind the kite?',
        options: ['Two silver ribbons', 'A long bell', 'A yellow streamer'],
        answer: 'Two silver ribbons'
      }
    ]
  },
  {
    id: 3,
    title: 'The Mystery of the Whispering Cave',
    gradeLevel: 4,
    category: 'Adventure',
    lexileLevel: '520L',
    wordCount: 98,
    contentText: 'High on the rocky cliff above the village lay the Whispering Cave. Whenever the evening breeze drifted in from the ocean, deep musical notes echoed through the stone opening. Leo and his golden retriever, Rusty, decided to investigate. Armed with a reliable brass lantern, they discovered that wind blowing through narrow limestone hollows acted just like an enormous natural flute.',
    audioNarrationText: 'High on the rocky cliff above the village lay the Whispering Cave. Whenever the evening breeze drifted in from the ocean, deep musical notes echoed through the stone opening. Leo and his golden retriever, Rusty, decided to investigate. Armed with a reliable brass lantern, they discovered that wind blowing through narrow limestone hollows acted just like an enormous natural flute.',
    syllableBreakdown: {
      investigate: 'in-ves-ti-gate',
      reliable: 're-li-a-ble',
      limestone: 'lime-stone',
      enormous: 'e-nor-mous'
    },
    comprehensionQuestions: [
      {
        question: 'What made the whispering sound in the cave?',
        options: ['Wind through limestone hollows', 'A hidden animal', 'An underground waterfall'],
        answer: 'Wind through limestone hollows'
      }
    ]
  }
];

export const mockAssignments: AssignmentItem[] = [
  {
    id: 1,
    title: 'Weekly Focus: B vs D Letter Detective',
    instructions: 'Complete 5 rounds of letter discrimination before Friday.',
    dueDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
    isCompleted: false,
    activityId: 1,
    activityTitle: 'B vs D Detective',
    activityType: 'LetterDiscrimination',
    teacherName: 'Sarah Jenkins, M.Ed.'
  },
  {
    id: 2,
    title: 'Sound Blending Practice',
    instructions: 'Practice 3-phoneme word building challenge.',
    dueDate: new Date(Date.now() + 3600000 * 24 * 6).toISOString(),
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    score: 95,
    activityId: 2,
    activityTitle: 'Sound to Letter Builder',
    activityType: 'WordBuilding',
    teacherName: 'Sarah Jenkins, M.Ed.'
  }
];

export const mockProgressReport: ProgressReport = {
  id: 1,
  studentId: 1,
  studentName: 'Aarav Sharma',
  age: 8,
  gradeLevel: 3,
  reportDate: new Date().toISOString(),
  periodStart: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  periodEnd: new Date().toISOString(),
  overallSummary: 'Aarav has shown enthusiastic engagement during reading sessions. His auditory comprehension and story recall remain in the top quartile (84%). Key developmental focus areas include visual letter discrimination and phoneme-to-grapheme spelling correspondence.',
  skillBreakdown: {
    Phonics: 61,
    Reading: 72,
    Spelling: 68,
    'Word Recognition': 64,
    Vocabulary: 79,
    Comprehension: 84
  },
  commonErrorsSummary: '1. Reversible letter confusion (b/d)\n2. Phonetic spellings (e.g., "kat" instead of "cat")\n3. Mild hesitation on unfamiliar multi-syllable sight words',
  recommendedActionPlan: '1. Daily 5-minute visual discrimination drills (B vs D Detective).\n2. Tactile letter tracing in sand or kinetic foam.\n3. Guided audio-assisted reading with syllable highlighting in the LexiCare Reading Assistant.\n4. Celebrate steady progress to keep confidence soaring!',
  disclaimerText: 'This report provides educational observations and does not constitute a medical diagnosis.'
};
