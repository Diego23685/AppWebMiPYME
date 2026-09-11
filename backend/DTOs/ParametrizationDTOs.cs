using System.ComponentModel.DataAnnotations;
using BusinessPlanSimulator.Api.Models.Entities;

namespace BusinessPlanSimulator.Api.DTOs;

public record SettingsDto(
    string MarketArea,
    decimal MonthlyPayrollExpense,
    decimal EmployerTaxRate,
    decimal InatecTaxRate,
    decimal ChristmasBonusRate,
    decimal SeveranceRate,
    decimal VacationRate,
    decimal OtherProvisionsRate,
    int StartYear,
    int CollectionDays,
    int SupplierPaymentDays,
    int DebtTermYears,
    decimal SalesCommissionRate
);

public record ProductDto(
    int Id,
    [Required] string Name,
    string Description,
    [Range(1, int.MaxValue)] int BaseYearDemand,
    decimal AnnualGrowthRate,
    decimal TargetPriceCostRatio,
    int FinishedGoodsInventoryDays,
    [Range(1, int.MaxValue)] int BatchSize
);

public record RawMaterialDto(
    int Id,
    [Required] string Description,
    [Required] string UnitOfMeasure,
    [Range(0.0001, double.MaxValue)] decimal UnitCost,
    int RawMaterialInventoryDays
);

public record MacroParamDto(
    int YearIndex,
    decimal InflationRate,
    decimal GdpGrowthRate,
    decimal ReferenceInterestRate,
    decimal RiskFreeRate,
    decimal IncomeTaxRate,
    decimal ProjectRiskPremium,
    decimal TMAR,
    decimal WACC
);

public record OperationalExpenseDto(
    int Id,
    [Required] string Concept,
    decimal Year1,
    decimal Year2,
    decimal Year3,
    decimal Year4,
    decimal Year5
);

public record AssetInvestmentDto(
    int Id,
    [Required] string Name,
    AssetCategory Category,
    string Unit,
    [Range(1, int.MaxValue)] int Quantity,
    [Range(0.01, double.MaxValue)] decimal UnitValue,
    [Range(1, 100)] int UsefulLifeYears
);