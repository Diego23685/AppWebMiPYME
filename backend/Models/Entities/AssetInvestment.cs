using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public enum AssetCategory
{
    CapitalDeTrabajo,
    ActivoFijo,
    OtrosActivos
}

public class AssetInvestment
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public AssetCategory Category { get; set; }

    [MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitValue { get; set; }

    public int UsefulLifeYears { get; set; } // Vida útil en años para depreciación lineal
}