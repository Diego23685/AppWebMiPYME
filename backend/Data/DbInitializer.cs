using BusinessPlanSimulator.Api.Models.Entities;
using BusinessPlanSimulator.Api.Models.Enums;

namespace BusinessPlanSimulator.Api.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
        context.Database.EnsureCreated();

        if (!context.Users.Any())
        {
            context.Users.Add(new User
            {
                FullName = "Administrador Sistema",
                Email = "admin@sistema.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123*"),
                Role = UserRole.Administrador,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            context.SaveChanges();
        }
    }
}