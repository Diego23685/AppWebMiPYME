using System.ComponentModel.DataAnnotations;
using BusinessPlanSimulator.Api.Models.Enums;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Secretario;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Macroplan> Macroplans { get; set; } = new List<Macroplan>();
    public ICollection<BusinessPlan> BusinessPlans { get; set; } = new List<BusinessPlan>();
}