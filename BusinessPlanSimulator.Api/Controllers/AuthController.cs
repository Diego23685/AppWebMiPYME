using System.Security.Claims;
using System.Security.Cryptography;
using BusinessPlanSimulator.Application.DTOs.Auth;
using BusinessPlanSimulator.Application.Interfaces;
using BusinessPlanSimulator.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessPlanSimulator.Domain.Entities;
using BusinessPlanSimulator.Domain.Enums;

namespace BusinessPlanSimulator.Api.Controllers;

public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Email, string Token, string NewPassword);
public record UpdateProfileDto(string FirstName, string LastName);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record AdminCreateUserDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    UserRole Role
);

public record UserSummaryDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAtUtc
);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _context;

    public AuthController(IAuthService authService, ApplicationDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());
        
        if (user == null || !user.IsActive)
        {
            return Ok(new { message = "Si el correo está registrado y activo, se generará el token de recuperación." });
        }

        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToHexString(tokenBytes);

        user.PasswordResetToken = token;
        user.ResetTokenExpiresUtc = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Instrucciones enviadas. Usa el siguiente token para restablecer:",
            resetToken = token 
        });
    }

    [HttpPost("admin/create-user")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminCreateUser([FromBody] AdminCreateUserDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            return BadRequest(new { message = "El correo electrónico ya se encuentra registrado." });
        }

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario registrado exitosamente.", userId = user.Id });
    }

    [HttpGet("admin/users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new UserSummaryDto(
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Role.ToString(),
                u.IsActive,
                u.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPatch("admin/users/{id}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuario no encontrado." });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Usuario {(user.IsActive ? "activado" : "desactivado")} exitosamente.", isActive = user.IsActive });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

        if (user == null || 
            user.PasswordResetToken != dto.Token || 
            !user.ResetTokenExpiresUtc.HasValue || 
            user.ResetTokenExpiresUtc.Value < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Token inválido o expirado." });
        }

        if (dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "La nueva contraseña debe tener al menos 6 caracteres." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.ResetTokenExpiresUtc = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Contraseña restablecida con éxito. Ya puedes iniciar sesión." });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Token inválido." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "Usuario no encontrado." });

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        await _context.SaveChangesAsync();

        return Ok(new { message = "Perfil actualizado con éxito.", fullName = $"{user.FirstName} {user.LastName}" });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Token inválido." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "Usuario no encontrado." });

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "La contraseña actual no es correcta." });
        }

        if (dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "La nueva contraseña debe tener al menos 6 caracteres." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Contraseña actualizada exitosamente." });
    }
}