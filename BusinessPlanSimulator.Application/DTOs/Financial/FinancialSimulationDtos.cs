namespace BusinessPlanSimulator.Application.DTOs.Financial;

public record FinancialInputDto(
    decimal InitialInvestment,       // Inversión fija inicial
    decimal WorkingCapital,          // Capital de trabajo inicial
    decimal DiscountRate,            // Tasa de descuento / WACC (ej: 0.12 = 12%)
    decimal IncomeTaxRate,           // Impuesto sobre la renta (ej: 0.30 = 30%)
    decimal InflationRate,           // Inflación estimada (ej: 0.05 = 5%)
    List<AnnualProjectionInputDto> Projections // Datos de los 5 años
);

public record AnnualProjectionInputDto(
    int Year,                        // 1 a 5
    decimal UnitsSold,               // Unidades estimadas
    decimal UnitPrice,               // Precio unitario
    decimal UnitCost,                // Costo variable unitario
    decimal FixedOperatingCosts,     // Costos fijos operativos (sin depreciación)
    decimal AnnualDepreciation       // Depreciación del periodo
);

public record YearFinancialStatementDto(
    int Year,
    decimal Revenue,
    decimal VariableCosts,
    decimal GrossMargin,
    decimal OperatingCosts,
    decimal Depreciation,
    decimal Ebit,                    // Utilidad Operativa
    decimal Taxes,
    decimal NetIncome,               // Utilidad Neta
    decimal OperatingCashFlow,       // Flujo de Caja Operativo (NetIncome + Depreciation)
    decimal FreeCashFlow             // Flujo de Caja Libre
);

public record FinancialRatiosDto(
    decimal GrossMarginPercentage,
    decimal NetMarginPercentage,
    decimal ReturnOnInvestment,      // ROI
    decimal BreakEvenPointUnits      // Punto de equilibrio año 1 (unidades)
);

public record SimulationResultDto(
    decimal Van,                     // Valor Actual Neto (NPV)
    decimal Tir,                     // Tasa Interna de Retorno (IRR en %)
    decimal PaybackPeriodYears,      // Periodo de Recuperación de Inversión
    bool IsViable,                   // Dictamen de viabilidad (VAN > 0)
    List<YearFinancialStatementDto> IncomeStatements,
    FinancialRatiosDto Year1Ratios
);