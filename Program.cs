using System.Text;
using LexiCare.Server.Data;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Middleware;
using LexiCare.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext with SQLite (local development) and SQL Server support
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    var conn = builder.Configuration.GetConnectionString("SqlServerConnection") ?? "Server=localhost;Database=LexiCare;Trusted_Connection=True;TrustServerCertificate=True;";
    builder.Services.AddDbContext<LexiCareDbContext>(options => options.UseSqlServer(conn));
}
else
{
    var conn = builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=lexicare.db";
    builder.Services.AddDbContext<LexiCareDbContext>(options => options.UseSqlite(conn));
}

// Add HTTP Client & Application Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IScreeningService, ScreeningService>();
builder.Services.AddScoped<ILearningService, LearningService>();
builder.Services.AddScoped<IReadingService, ReadingService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IParentService, ParentService>();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<IReportService, ReportService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "LexiCareSuperSecretProductionReadyEncryptionKey2026!WithExtraLengthForSecurity";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "LexiCareAPI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "LexiCareApp",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Permissive CORS for seamless local and client communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure Database is Created & Seed Initial High-Quality Demo Data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LexiCareDbContext>();
    await DbInitializer.SeedAsync(db);
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
