using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class PlanReviewNote
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    public int ReviewerUserId { get; set; }
    public User ReviewerUser { get; set; } = null!;

    [Required, MaxLength(100)]
    public string SectionName { get; set; } = string.Empty; // "Costos", "Proyecciones", "Finanzas"

    [Required]
    public string Comment { get; set; } = string.Empty;

    public bool IsResolved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}