using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Calculate

    [Required, MaxLength(100)]
    public string EntityName { get; set; } = string.Empty; // BusinessPlan, Settings, Macroplan

    public string EntityId { get; set; } = string.Empty;

    public string Details { get; set; } = string.Empty;

    [MaxLength(45)]
    public string IpAddress { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}