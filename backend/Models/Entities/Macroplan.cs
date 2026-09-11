using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class Macroplan
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public DateTime ValidityStartDate { get; set; }
    public DateTime ValidityEndDate { get; set; }

    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public bool IsDeleted { get; set; } = false; // RF04 Soft Delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BusinessPlan> BusinessPlans { get; set; } = new List<BusinessPlan>();
}