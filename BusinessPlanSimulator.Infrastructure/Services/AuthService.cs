using BusinessPlanSimulator.Application.DTOs.Auth;
using BusinessPlanSimulator.Application.Interfaces;
using BusinessPlanSimulator.Domain.Entities;
using BusinessPlanSimulator.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(ApplicationDbContext context, IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (emailExists)
        {
            throw new InvalidOperationException("El correo electrónico ya está registrado.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email,
            user.Role.ToString(),
            token
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales incorrectas.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("El usuario se encuentra inactivo.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email,
            user.Role.ToString(),
            token
        );
    }
}