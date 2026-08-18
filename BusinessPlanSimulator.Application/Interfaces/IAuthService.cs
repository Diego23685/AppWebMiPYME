using BusinessPlanSimulator.Application.DTOs.Auth;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
}