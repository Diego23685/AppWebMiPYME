using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class BusinessPlan
{
    public int Id { get; set; }

    public int MacroplanId { get; set; }
    public Macroplan Macroplan { get; set; } = null!;

    public int AuthorUserId { get; set; }
    public User AuthorUser { get; set; } = null!;

    [Required, MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string TaxId { get; set; } = string.Empty; // NIT/RUC

    [MaxLength(100)]
    public string CompanyType { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Sector { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
    public int LifespanYears { get; set; } = 5;

    public bool IsDeleted { get; set; } = false; // RF04 / RF08 Soft Delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}