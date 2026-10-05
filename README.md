# LexiCare | AI-Powered Educational Screening & Dyslexia Support

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e?style=for-the-badge&logo=github)](https://riyarj-11.github.io/LexiCare/)
[![Status](https://img.shields.io/badge/Status-Online%2024%2F7-0284c7?style=for-the-badge)](https://riyarj-11.github.io/LexiCare/)

👉 **Permanent Live Application URL (Share with friends/testers):**  
### 🌐 **[https://riyarj-11.github.io/LexiCare/](https://riyarj-11.github.io/LexiCare/)**

> **Important Safety & Educational Notice:**  
> *LexiCare is an educational screening and personalized learning support system designed to identify reading patterns and recommend targeted practice. It does **not** provide medical or formal clinical diagnoses.*

---

## 🌟 Overview

**LexiCare** addresses a critical real-world problem: many children with reading and writing difficulties do not get early support because signs are not recognized early, formal assessments are difficult to access, and students lack individualized, distraction-free learning tools.

LexiCare bridges this gap by connecting **Students**, **Parents**, and **Teachers** with:
- **Evidence-Based Educational Screening**: Identifies letter orientation issues (such as `b/d`), phoneme-grapheme correspondences, and orthographic spelling patterns without clinical labeling.
- **Adaptive Learning Engine**: Automatically adjusts activity difficulty based on student performance (≥90% increases challenge, 70–89% maintains pace, <70% provides scaffolded guidance).
- **Distraction-Free Reading Assistant**: Features OpenDyslexic typography, sentence-level focus rulers, syllable separation, and synchronized text-to-speech with word-by-word karaoke tracking.
- **Teacher & Parent Dashboards**: Empowers educators with classroom skill matrices and assignments, while giving parents clear, jargon-free progress summaries and home tips.
- **Professional Progress Reports**: Generates formal educational observations, difficulty pattern summaries, and 1-click printable PDF exports.
- **AI Pedagogical Assistant**: Answers parent and teacher questions with research-backed multi-sensory strategies (Orton-Gillingham informed) with strict medical safety guardrails.

---

## 🏗️ Architecture & Technology Stack

```
LexiCare/
├── server/                          # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/                 # REST Controllers (Auth, Student, Screening, Learning, Reading, Teacher, Parent, AI, Reports)
│   ├── Services/                    # Domain Business Logic & AI Recommendation Engine
│   ├── Interfaces/                  # Clean Architecture Service Contracts
│   ├── Models/                      # Entity Framework Core Entity Models
│   ├── DTOs/                        # Request and Response Data Transfer Objects
│   ├── Data/                        # LexiCareDbContext & Realistic Seed Data
│   ├── Middleware/                  # Global Exception Handling Middleware
│   └── appsettings.json             # SQLite (Default) & SQL Server Configuration
│
└── client/                          # React + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── components/              # Navbar, AccessibilityToolbar, EducationalDisclaimer
    │   ├── context/                 # AuthContext (1-click Demo Switching), AccessibilityContext
    │   ├── pages/                   # LandingPage, StudentDashboard, ScreeningFlow, AdaptiveLearningView,
    │   │                            # ReadingAssistant, TeacherDashboard, ParentDashboard, ProgressReportView, AIAssistantView
    │   ├── services/                # Typed REST API Client
    │   └── types/                   # Unified TypeScript Models & Interfaces
```

### Backend
- **Framework**: ASP.NET Core Web API (.NET 10.0)
- **Data Access**: Entity Framework Core with dual-database support:
  - **SQLite** (Default local development: `lexicare.db`)
  - **SQL Server** (Production ready via configuration string)
- **Security**: JWT Bearer Authentication & BCrypt Password Hashing
- **Architecture**: Clean Architecture separating controllers, domain services, repositories, and DTOs

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Utilities
- **Typography & Accessibility**: OpenDyslexic web font, Lexend font, adjustable sizing, line/letter spacing, high-contrast themes, focus ruler
- **Speech**: Web Speech API Text-to-Speech with speech rate modulation and boundary tracking
- **PDF Generation**: High-fidelity client-side PDF generation via `jspdf`
- **Gamification**: XP points, daily streaks, unlocked badge milestones, and celebrations via `canvas-confetti`

---

## 🔑 Demo Accounts (Instant 1-Click Evaluation)

The application includes realistic, pre-populated accounts for every role:

| Role | Name | Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma (Grade 3) | `student@lexicare.com` | `Student123!` | Phonics games, reading assistant, streaks, XP & badges |
| **Teacher** | Sarah Jenkins, M.Ed. | `teacher@lexicare.edu` | `Teacher123!` | Classroom analytics, skill matrix, assign exercises, learning plans |
| **Parent** | Priya Sharma | `parent@lexicare.com` | `Parent123!` | Plain-language summaries, weekly time goals, home tips |
| **Admin** | System Administrator | `admin@lexicare.com` | `Admin123!` | Platform management & oversight |

> 💡 *Quick Switch Tip:* In the top-right navigation bar, click the **"Role: [Role Name]"** badge to immediately switch between Student, Teacher, and Parent accounts without re-entering credentials!

---

## 🚀 Running Locally

### 1. Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js v20+](https://nodejs.org/)

### 2. Start the Backend API
```bash
cd server
dotnet run --launch-profile http
```
The server will start listening at `http://localhost:5200` and automatically create and seed the SQLite database `lexicare.db`.

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
The client will start at `http://localhost:3000` with the Vite proxy automatically routing `/api` requests to the backend.

---

## 🛡️ Educational Safety Principles

LexiCare strictly avoids medical claims:
1. **No Medical Labels**: Never labels results as "Dyslexia Detected". Instead, reports:
   - *"No significant difficulty observed"*
   - *"Some areas may benefit from additional practice"*
   - *"Consistent difficulty observed — consider consulting a qualified specialist"*
2. **Prominent Disclaimers**: Disclaimers are rendered on every page, screening session, and generated PDF report.
3. **Specialist Referrals**: Prominently guides parents and teachers to certified educational psychologists and speech-language pathologists when persistent challenges are detected.
