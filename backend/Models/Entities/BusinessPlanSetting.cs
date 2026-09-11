using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class BusinessPlanSetting
{
    [Key, ForeignKey(nameof(BusinessPlan))]
    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    // Mercado / Influencia
    [MaxLength(200)]
    public string MarketArea { get; set; } = string.Empty;

    // Parámetros Salariales y Cargas Patronales
    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyPayrollExpense { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal EmployerTaxRate { get; set; } // % Impuesto patronal (ej. INSS 21.5% o 22.5%)

    [Column(TypeName = "decimal(5,2)")]
    public decimal InatecTaxRate { get; set; } // % INATEC (ej. 2%)

    // Cargas de Ley y Provisiones
    [Column(TypeName = "decimal(5,2)")]
    public decimal ChristmasBonusRate { get; set; } // Aguinaldo / 13vo mes (8.33%)

    [Column(TypeName = "decimal(5,2)")]
    public decimal SeveranceRate { get; set; } // Cesantías / Antigüedad (8.33%)

    [Column(TypeName = "decimal(5,2)")]
    public decimal VacationRate { get; set; } // Vacaciones (8.33%)

    [Column(TypeName = "decimal(5,2)")]
    public decimal OtherProvisionsRate { get; set; } = 0.0m; // Parafiscales / Intereses adicionales

    // Directrices Operativas
    public int StartYear { get; set; }
    public int CollectionDays { get; set; } // Días de crédito otorgados a clientes
    public int SupplierPaymentDays { get; set; } // Días de crédito con proveedores de MP
    public int DebtTermYears { get; set; } // Plazo de amortización de pasivos
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal SalesCommissionRate { get; set; } // % Comisión sobre ventas
}