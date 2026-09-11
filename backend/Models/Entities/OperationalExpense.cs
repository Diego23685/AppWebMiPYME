using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class OperationalExpense
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Concept { get; set; } = string.Empty; // Arrendamiento, luz, agua, seguros...

    [Column(TypeName = "decimal(18,2)")]
    public decimal Year1 { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Year2 { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Year3 { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Year4 { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Year5 { get; set; }
}