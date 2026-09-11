using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class RawMaterial
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string UnitOfMeasure { get; set; } = string.Empty; // kg, lt, unidad, etc.

    [Column(TypeName = "decimal(18,4)")]
    public decimal UnitCost { get; set; }

    public int RawMaterialInventoryDays { get; set; } // Política stock MP en días
}