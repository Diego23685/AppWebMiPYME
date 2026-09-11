using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class Product
{
    public int Id { get; set; }

    public int BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // Proyecciones Base
    public int BaseYearDemand { get; set; } // Demanda en unidades año 1

    [Column(TypeName = "decimal(5,2)")]
    public decimal AnnualGrowthRate { get; set; } // % crecimiento anual

    [Column(TypeName = "decimal(8,4)")]
    public decimal TargetPriceCostRatio { get; set; } // Relación precio / costo (margen)

    public int FinishedGoodsInventoryDays { get; set; } // Política stock PT en días

    public int BatchSize { get; set; } // Tamaño del lote en unidades

    public ICollection<ProductBOM> BillOfMaterials { get; set; } = new List<ProductBOM>();
    public ICollection<ProductOverhead> Overheads { get; set; } = new List<ProductOverhead>();
}