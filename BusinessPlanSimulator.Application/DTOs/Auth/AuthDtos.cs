using BusinessPlanSimulator.Domain.Enums;

namespace BusinessPlanSimulator.Application.DTOs.Auth;

public record RegisterRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    UserRole Role
);

public record LoginRequestDto(
    string Email,
    string Password
);

public record AuthResponseDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    string Token
);