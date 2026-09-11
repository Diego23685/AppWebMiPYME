using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.DTOs;

public record AddBomItemDto(
    [Required] int RawMaterialId,
    [Range(0.0001, double.MaxValue)] decimal QuantityPerBatch
);

public record BomItemResponseDto(
    int Id,
    int RawMaterialId,
    string RawMaterialDescription,
    string UnitOfMeasure,
    decimal UnitCost,
    decimal QuantityPerBatch,
    decimal PartialCost // Costo Unitario * Cantidad
);

public record AddOverheadDto(
    [Required, MaxLength(150)] string Concept,
    [MaxLength(50)] string UnitOfMeasure,
    [Range(0.0001, double.MaxValue)] decimal UnitCost,
    [Range(0.0001, double.MaxValue)] decimal QuantityPerBatch
);

public record OverheadResponseDto(
    int Id,
    string Concept,
    string UnitOfMeasure,
    decimal UnitCost,
    decimal QuantityPerBatch,
    decimal PartialCost
);

public record BatchCostSummaryDto(
    int ProductId,
    string ProductName,
    int BatchSize,
    decimal DirectMaterialsTotal,
    decimal ManufacturingOverheadTotal,
    decimal TotalBatchCost,
    decimal UnitCost,
    List<BomItemResponseDto> Materials,
    List<OverheadResponseDto> Overheads
);