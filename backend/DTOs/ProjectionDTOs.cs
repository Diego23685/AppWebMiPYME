namespace BusinessPlanSimulator.Api.DTOs;

public record ProductSalesProjectionDto(
    int ProductId,
    string ProductName,
    int[] DemandUnits,              // Año 1 a 5
    decimal[] UnitSellingPrices,    // Precio proyectado indexado por margen/inflación
    decimal[] TotalRevenues         // Demanda * Precio de venta
);

public record FinishedGoodsInventoryDto(
    int ProductId,
    string ProductName,
    int[] InitialStockUnits,
    int[] ProductionRequiredUnits,
    int[] TotalAvailableUnits,
    int[] SalesUnits,
    int[] FinalStockUnits,
    decimal[] UnitProductionCosts,
    decimal[] FinalStockValuation   // FinalStockUnits * UnitProductionCost
);

public record RawMaterialInventoryDto(
    int RawMaterialId,
    string Description,
    string UnitOfMeasure,
    decimal[] InitialStockUnits,
    decimal[] ProductionConsumptionUnits,
    decimal[] DesiredFinalStockUnits,
    decimal[] PurchasesRequiredUnits,
    decimal[] UnitCostsIndexed,
    decimal[] TotalPurchasesCost,
    decimal[] FinalStockValuation
);

public record DebtAmortizationScheduleDto(
    int YearIndex,
    decimal InitialBalance,
    decimal InterestPayment,
    decimal PrincipalPayment,
    decimal TotalAnnuity,
    decimal FinalBalance
);

public record FullProjectionSummaryDto(
    List<ProductSalesProjectionDto> SalesProjections,
    decimal[] ConsolidatedRevenues,
    List<FinishedGoodsInventoryDto> FinishedGoodsInventory,
    List<RawMaterialInventoryDto> RawMaterialsInventory,
    List<DebtAmortizationScheduleDto> DebtSchedule,
    decimal TotalDebtFinanced
);