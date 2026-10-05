using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LexiCare.Server.Data;
using LexiCare.Server.DTOs;
using LexiCare.Server.Interfaces;
using LexiCare.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LexiCare.Server.Services;

public class AuthService : IAuthService
{
    private readonly LexiCareDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(LexiCareDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.ParentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (exists)
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            role = UserRole.Student;
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        if (role == UserRole.Student)
        {
            var student = new Student
            {
                UserId = user.Id,
                GradeLevel = request.GradeLevel ?? 3,
                Age = request.Age ?? 8,
                CurrentStreak = 1,
                TotalXp = 50,
                Level = 1
            };
            await _context.Students.AddAsync(student);
            await _context.SaveChangesAsync();

            // Link initial skills
            var skills = await _context.Skills.ToListAsync();
            foreach (var s in skills)
            {
                await _context.StudentSkillProgresses.AddAsync(new StudentSkillProgress
                {
                    StudentId = student.Id,
                    SkillId = s.Id,
                    CurrentScore = 70,
                    Level = "Developing",
                    AccuracyRate = 70
                });
            }
            await _context.SaveChangesAsync();
            user.StudentProfile = student;
        }
        else if (role == UserRole.Parent)
        {
            var parent = new Parent
            {
                UserId = user.Id
            };
            await _context.Parents.AddAsync(parent);
            await _context.SaveChangesAsync();
            user.ParentProfile = parent;
        }
        else if (role == UserRole.Teacher)
        {
            var teacher = new Teacher
            {
                UserId = user.Id,
                SchoolName = request.SchoolName ?? "Elementary Academy"
            };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();
            user.TeacherProfile = teacher;
        }

        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.ParentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user == null ? null : MapToUserDto(user);
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Key"] ?? "LexiCareSuperSecretProductionReadyEncryptionKey2026!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        if (user.StudentProfile != null)
        {
            claims.Add(new Claim("StudentId", user.StudentProfile.Id.ToString()));
        }
        if (user.ParentProfile != null)
        {
            claims.Add(new Claim("ParentId", user.ParentProfile.Id.ToString()));
        }
        if (user.TeacherProfile != null)
        {
            claims.Add(new Claim("TeacherId", user.TeacherProfile.Id.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "LexiCareAPI",
            audience: _configuration["Jwt:Audience"] ?? "LexiCareApp",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl,
            StudentId = user.StudentProfile?.Id,
            ParentId = user.ParentProfile?.Id,
            TeacherId = user.TeacherProfile?.Id
        };
    }
}
