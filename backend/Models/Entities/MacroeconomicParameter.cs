using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class MacroeconomicParameter
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    public int YearIndex { get; set; } // 1 a 5

    [Column(TypeName = "decimal(5,2)")]
    public decimal InflationRate { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal GdpGrowthRate { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal ReferenceInterestRate { get; set; } // Tasa de deuda de mercado

    [Column(TypeName = "decimal(5,2)")]
    public decimal RiskFreeRate { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal IncomeTaxRate { get; set; } // Tasa impositiva renta

    // Tasas de descuento y evaluación (Definidas en Año 1)
    [Column(TypeName = "decimal(5,2)")]
    public decimal ProjectRiskPremium { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal TMAR { get; set; } // Tasa Mínima Aceptable de Rendimiento

    [Column(TypeName = "decimal(5,2)")]
    public decimal WACC { get; set; } // Costo de Capital Promedio Ponderado
}