namespace BusinessPlanSimulator.Api.DTOs;

public record AnnualPayrollBreakdownDto(
    decimal[] BaseSalaries,
    decimal[] EmployerTax,
    decimal[] InatecTax,
    decimal[] ChristmasBonus,
    decimal[] SeveranceProvision,
    decimal[] VacationProvision,
    decimal[] TotalPayrollExpense
);

public record IncomeStatementDto(
    decimal[] Revenues,
    decimal[] CostOfGoodsSold,
    decimal[] GrossProfit,
    decimal[] OperatingExpenses,
    decimal[] SalesCommissions,
    decimal[] PayrollExpense,
    decimal[] DepreciationExpense,
    decimal[] OperatingIncome,     // EBIT
    decimal[] InterestExpense,
    decimal[] PreTaxIncome,        // EBT
    decimal[] IncomeTax,
    decimal[] NetIncome
);

public record CashFlowStatementDto(
    decimal InitialCash,
    decimal[] CashCollections,
    decimal[] SupplierPayments,
    decimal[] PayrollCashOutflows,
    decimal[] OperatingExpensesPaid,
    decimal[] CommissionsPaid,
    decimal[] IncomeTaxPaid,
    decimal[] OperatingCashFlow,
    decimal InitialInvestmentOutflow,
    decimal[] DebtDisbursements,
    decimal[] PrincipalRepayments,
    decimal[] InterestPaid,
    decimal[] FinancingCashFlow,
    decimal[] NetCashChange,
    decimal[] EndingCashBalance
);

public record BalanceSheetDto(
    // Activo Corriente
    decimal[] Cash,
    decimal[] AccountsReceivable,
    decimal[] FinishedGoodsInventory,
    decimal[] RawMaterialsInventory,
    decimal[] TotalCurrentAssets,

    // Activo No Corriente
    decimal[] GrossFixedAssets,
    decimal[] AccumulatedDepreciation,
    decimal[] NetFixedAssets,
    decimal[] TotalAssets,

    // Pasivo Corriente
    decimal[] AccountsPayable,
    decimal[] ShortTermDebt,
    decimal[] TotalCurrentLiabilities,

    // Pasivo No Corriente
    decimal[] LongTermDebt,
    decimal[] TotalLiabilities,

    // Patrimonio
    decimal[] InitialEquity,
    decimal[] RetainedEarnings,
    decimal[] TotalEquity,
    decimal[] TotalLiabilitiesAndEquity,
    bool[] IsBalanced
);

public record FinancialRatiosDto(
    // Liquidez
    decimal[] CurrentRatio,
    decimal[] QuickRatio,
    decimal[] NetWorkingCapital,

    // Endeudamiento
    decimal[] DebtRatio,
    decimal[] DebtToEquityRatio,

    // Rentabilidad
    decimal[] GrossMargin,
    decimal[] OperatingMargin,
    decimal[] NetMargin,
    decimal[] ReturnOnAssets,
    decimal[] ReturnOnEquity
);

public record FeasibilityEvaluationDto(
    decimal InitialInvestment,
    decimal[] FreeCashFlows,
    decimal DiscountRateWacc,
    decimal Tmar,
    decimal NetPresentValue,
    decimal InternalRateOfReturn,
    bool IsViable,
    string FeasibilityVerdict
);

public record FullFinancialReportDto(
    AnnualPayrollBreakdownDto Payroll,
    IncomeStatementDto IncomeStatement,
    CashFlowStatementDto CashFlow,
    BalanceSheetDto BalanceSheet,
    FinancialRatiosDto Ratios,
    FeasibilityEvaluationDto Feasibility
);