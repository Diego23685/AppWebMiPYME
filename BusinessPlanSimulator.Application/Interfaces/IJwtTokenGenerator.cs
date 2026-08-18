using BusinessPlanSimulator.Domain.Entities;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}