using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPlanSimulator.Api.Models.Entities;

public class ProductBOM
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int RawMaterialId { get; set; }
    public RawMaterial RawMaterial { get; set; } = null!;

    [Column(TypeName = "decimal(18,4)")]
    public decimal QuantityPerBatch { get; set; } // Consumo de MP por tamaño de lote
}