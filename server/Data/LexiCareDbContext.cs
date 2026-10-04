using Microsoft.EntityFrameworkCore;
using LexiCare.Server.Models;

namespace LexiCare.Server.Data;

public class LexiCareDbContext : DbContext
{
    public LexiCareDbContext(DbContextOptions<LexiCareDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<StudentSkillProgress> StudentSkillProgresses => Set<StudentSkillProgress>();
    public DbSet<ScreeningQuestion> ScreeningQuestions => Set<ScreeningQuestion>();
    public DbSet<ScreeningSession> ScreeningSessions => Set<ScreeningSession>();
    public DbSet<ScreeningResponse> ScreeningResponses => Set<ScreeningResponse>();
    public DbSet<LearningActivity> LearningActivities => Set<LearningActivity>();
    public DbSet<ActivityAttempt> ActivityAttempts => Set<ActivityAttempt>();
    public DbSet<LearningPlan> LearningPlans => Set<LearningPlan>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<ReadingMaterial> ReadingMaterials => Set<ReadingMaterial>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<StudentAchievement> StudentAchievements => Set<StudentAchievement>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AIRecommendation> AIRecommendations => Set<AIRecommendation>();
    public DbSet<ProgressReport> ProgressReports => Set<ProgressReport>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User unique email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // 1-to-1 User <-> Student/Parent/Teacher
        modelBuilder.Entity<Student>()
            .HasOne(s => s.User)
            .WithOne(u => u.StudentProfile)
            .HasForeignKey<Student>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Parent>()
            .HasOne(p => p.User)
            .WithOne(u => u.ParentProfile)
            .HasForeignKey<Parent>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Teacher>()
            .HasOne(t => t.User)
            .WithOne(u => u.TeacherProfile)
            .HasForeignKey<Teacher>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Parent -> Students (1-to-many)
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Parent)
            .WithMany(p => p.Children)
            .HasForeignKey(s => s.ParentId)
            .OnDelete(DeleteBehavior.SetNull);

        // ClassStudent Composite Index
        modelBuilder.Entity<ClassStudent>()
            .HasIndex(cs => new { cs.ClassId, cs.StudentId })
            .IsUnique();

        // StudentSkillProgress Unique Index per Student & Skill
        modelBuilder.Entity<StudentSkillProgress>()
            .HasIndex(ssp => new { ssp.StudentId, ssp.SkillId })
            .IsUnique();

        // StudentAchievement Unique Index
        modelBuilder.Entity<StudentAchievement>()
            .HasIndex(sa => new { sa.StudentId, sa.AchievementId })
            .IsUnique();

        // ScreeningSession & Responses
        modelBuilder.Entity<ScreeningResponse>()
            .HasOne(sr => sr.Session)
            .WithMany(s => s.Responses)
            .HasForeignKey(sr => sr.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict cascade delete cycles where needed
        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Teacher)
            .WithMany(t => t.AssignedWork)
            .HasForeignKey(a => a.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Class)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Student)
            .WithMany(s => s.Assignments)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
