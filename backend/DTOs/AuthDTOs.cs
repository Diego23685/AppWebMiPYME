using System.ComponentModel.DataAnnotations;
using BusinessPlanSimulator.Api.Models.Enums;

namespace BusinessPlanSimulator.Api.DTOs;

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RegisterUserDto(
    [Required, MaxLength(150)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] UserRole Role
);

public record AuthResponseDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string Token
);

public record UserDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt
);