using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Services;

public interface IFinancialStatementService
{
    Task<FullFinancialReportDto> GenerateFinancialReportAsync(int businessPlanId);
}

public class FinancialStatementService : IFinancialStatementService
{
    private readonly AppDbContext _context;
    private readonly IProjectionEngineService _engineService;

    public FinancialStatementService(AppDbContext context, IProjectionEngineService engineService)
    {
        _context = context;
        _engineService = engineService;
    }

    public async Task<FullFinancialReportDto> GenerateFinancialReportAsync(int businessPlanId)
    {
        var settings = await _context.BusinessPlanSettings.FirstOrDefaultAsync(s => s.BusinessPlanId == businessPlanId)
            ?? throw new InvalidOperationException("Faltan directrices y parámetros salariales (RF09).");

        var macroParams = await _context.MacroeconomicParameters
            .Where(m => m.BusinessPlanId == businessPlanId)
            .OrderBy(m => m.YearIndex)
            .ToListAsync();

        if (macroParams.Count < 5)
            throw new InvalidOperationException("Se requieren parámetros macroeconómicos para 5 años (RF12).");

        var expenses = await _context.OperationalExpenses
            .Where(e => e.BusinessPlanId == businessPlanId)
            .ToListAsync();

        var assets = await _context.AssetInvestments
            .Where(a => a.BusinessPlanId == businessPlanId)
            .ToListAsync();

        // 1. Proyecciones operativas y comerciales del Módulo 5
        var projections = await _engineService.CalculateProjectionsAsync(businessPlanId);

        // 2. Liquidación Multianual de Nómina (RF23)
        var payroll = CalculatePayroll(settings, macroParams);

        // 3. Depreciación Lineal de Activos Fijos (RF15)
        decimal annualDepreciation = assets
            .Where(a => a.Category == AssetCategory.ActivoFijo && a.UsefulLifeYears > 0)
            .Sum(a => (a.Quantity * a.UnitValue) / a.UsefulLifeYears);

        decimal totalFixedAssetsCost = assets
            .Where(a => a.Category == AssetCategory.ActivoFijo)
            .Sum(a => a.Quantity * a.UnitValue);

        decimal totalInitialInvestment = assets.Sum(a => a.Quantity * a.UnitValue);

        // 4. Estado de Resultados (RF24)
        var isRevenues = projections.ConsolidatedRevenues;
        var isCogs = new decimal[5];
        var isGrossProfit = new decimal[5];
        var isOpex = new decimal[5];
        var isCommissions = new decimal[5];
        var isOperatingIncome = new decimal[5];
        var isInterest = new decimal[5];
        var isPreTaxIncome = new decimal[5];
        var isTax = new decimal[5];
        var isNetIncome = new decimal[5];
        var isDepreciation = new decimal[5];

        for (int t = 0; t < 5; t++)
        {
            // Costo de ventas = Ventas en unidades * Costo unitario indexado por producto
            decimal cogsYear = 0m;
            foreach (var fg in projections.FinishedGoodsInventory)
            {
                cogsYear += fg.SalesUnits[t] * fg.UnitProductionCosts[t];
            }
            isCogs[t] = Math.Round(cogsYear, 2);
            isGrossProfit[t] = isRevenues[t] - isCogs[t];

            // Gastos fijos registrados
            decimal fixedOpex = t switch
            {
                0 => expenses.Sum(e => e.Year1),
                1 => expenses.Sum(e => e.Year2),
                2 => expenses.Sum(e => e.Year3),
                3 => expenses.Sum(e => e.Year4),
                4 => expenses.Sum(e => e.Year5),
                _ => 0m
            };
            isOpex[t] = fixedOpex;

            // Comisión por ventas
            isCommissions[t] = Math.Round(isRevenues[t] * (settings.SalesCommissionRate / 100.0m), 2);
            isDepreciation[t] = annualDepreciation;

            // EBIT = Margen Bruto - Gastos Operacionales - Comisiones - Nómina - Depreciación
            isOperatingIncome[t] = isGrossProfit[t] - isOpex[t] - isCommissions[t] - payroll.TotalPayrollExpense[t] - isDepreciation[t];

            // Intereses de deuda
            isInterest[t] = projections.DebtSchedule[t].InterestPayment;
            isPreTaxIncome[t] = isOperatingIncome[t] - isInterest[t];

            // Impuesto sobre la renta si la utilidad contable es positiva
            decimal taxRate = macroParams[t].IncomeTaxRate / 100.0m;
            isTax[t] = isPreTaxIncome[t] > 0 ? Math.Round(isPreTaxIncome[t] * taxRate, 2) : 0m;
            isNetIncome[t] = isPreTaxIncome[t] - isTax[t];
        }

        var incomeStatement = new IncomeStatementDto(
            isRevenues, isCogs, isGrossProfit, isOpex, isCommissions,
            payroll.TotalPayrollExpense, isDepreciation, isOperatingIncome,
            isInterest, isPreTaxIncome, isTax, isNetIncome
        );

        // 5. Flujo de Caja y Balance General Proyectado
        var (cashFlow, balanceSheet) = BuildCashFlowAndBalanceSheet(
            settings, macroParams, projections, incomeStatement, payroll,
            totalInitialInvestment, totalFixedAssetsCost, annualDepreciation
        );

        // 6. Ratios e Indicadores Financieros (RF26)
        var ratios = CalculateFinancialRatios(incomeStatement, balanceSheet);

        // 7. Evaluación Financiera (VPN, TIR, Dictamen - RF27)
        var feasibility = CalculateFeasibility(totalInitialInvestment, incomeStatement, isDepreciation, macroParams);

        return new FullFinancialReportDto(payroll, incomeStatement, cashFlow, balanceSheet, ratios, feasibility);
    }

    private static AnnualPayrollBreakdownDto CalculatePayroll(BusinessPlanSetting settings, List<MacroeconomicParameter> macroParams)
    {
        var baseSalaries = new decimal[5];
        var employerTax = new decimal[5];
        var inatecTax = new decimal[5];
        var christmasBonus = new decimal[5];
        var severance = new decimal[5];
        var vacation = new decimal[5];
        var total = new decimal[5];

        decimal baseYearlySalary = settings.MonthlyPayrollExpense * 12.0m;
        decimal inflationFactor = 1.0m;

        for (int t = 0; t < 5; t++)
        {
            if (t > 0)
                inflationFactor *= (1.0m + (macroParams[t].InflationRate / 100.0m));

            baseSalaries[t] = Math.Round(baseYearlySalary * inflationFactor, 2);
            employerTax[t] = Math.Round(baseSalaries[t] * (settings.EmployerTaxRate / 100.0m), 2);
            inatecTax[t] = Math.Round(baseSalaries[t] * (settings.InatecTaxRate / 100.0m), 2);
            christmasBonus[t] = Math.Round(baseSalaries[t] * (settings.ChristmasBonusRate / 100.0m), 2);
            severance[t] = Math.Round(baseSalaries[t] * (settings.SeveranceRate / 100.0m), 2);
            vacation[t] = Math.Round(baseSalaries[t] * (settings.VacationRate / 100.0m), 2);

            total[t] = baseSalaries[t] + employerTax[t] + inatecTax[t] + christmasBonus[t] + severance[t] + vacation[t];
        }

        return new AnnualPayrollBreakdownDto(baseSalaries, employerTax, inatecTax, christmasBonus, severance, vacation, total);
    }

    private static (CashFlowStatementDto, BalanceSheetDto) BuildCashFlowAndBalanceSheet(
        BusinessPlanSetting settings,
        List<MacroeconomicParameter> macroParams,
        FullProjectionSummaryDto projections,
        IncomeStatementDto incomeStatement,
        AnnualPayrollBreakdownDto payroll,
        decimal totalInitialInvestment,
        decimal totalFixedAssetsCost,
        decimal annualDepreciation)
    {
        var cashCollections = new decimal[5];
        var supplierPayments = new decimal[5];
        var operatingCashFlow = new decimal[5];
        var principalRepayments = new decimal[5];
        var interestPaid = new decimal[5];
        var financingCashFlow = new decimal[5];
        var netCashChange = new decimal[5];
        var endingCashBalance = new decimal[5];

        // Balances
        var accountsReceivable = new decimal[5];
        var accountsPayable = new decimal[5];
        var finishedGoodsInv = new decimal[5];
        var rawMaterialsInv = new decimal[5];
        var grossFixedAssets = new decimal[5];
        var accumulatedDeprec = new decimal[5];
        var netFixedAssets = new decimal[5];
        var currentAssets = new decimal[5];
        var totalAssets = new decimal[5];
        var shortTermDebt = new decimal[5];
        var longTermDebt = new decimal[5];
        var currentLiabilities = new decimal[5];
        var totalLiabilities = new decimal[5];
        var initialEquity = new decimal[5];
        var retainedEarnings = new decimal[5];
        var totalEquity = new decimal[5];
        var totalLiabEquity = new decimal[5];
        var isBalanced = new bool[5];

        // Aporte inicial de socios = Inversión total - Endeudamiento inicial
        decimal equityCapital = totalInitialInvestment - projections.TotalDebtFinanced;

        decimal currentCash = 0m;
        decimal currentRetainedEarnings = 0m;
        decimal prevAccountsReceivable = 0m;
        decimal prevAccountsPayable = 0m;

        for (int t = 0; t < 5; t++)
        {
            // Compras totales de MP del año
            decimal purchasesCost = projections.RawMaterialsInventory.Sum(r => r.TotalPurchasesCost[t]);

            // Cuentas por cobrar = (Ventas / 365) * Días cobro
            accountsReceivable[t] = Math.Round((incomeStatement.Revenues[t] / 365.0m) * settings.CollectionDays, 2);
            cashCollections[t] = incomeStatement.Revenues[t] + prevAccountsReceivable - accountsReceivable[t];
            prevAccountsReceivable = accountsReceivable[t];

            // Cuentas por pagar = (Compras / 365) * Días pago
            accountsPayable[t] = Math.Round((purchasesCost / 365.0m) * settings.SupplierPaymentDays, 2);
            supplierPayments[t] = purchasesCost + prevAccountsPayable - accountsPayable[t];
            prevAccountsPayable = accountsPayable[t];

            // Flujo Operativo
            operatingCashFlow[t] = cashCollections[t]
                - supplierPayments[t]
                - payroll.TotalPayrollExpense[t]
                - incomeStatement.OperatingExpenses[t]
                - incomeStatement.SalesCommissions[t]
                - incomeStatement.IncomeTax[t];

            // Servicio de la deuda
            principalRepayments[t] = projections.DebtSchedule[t].PrincipalPayment;
            interestPaid[t] = projections.DebtSchedule[t].InterestPayment;
            financingCashFlow[t] = -(principalRepayments[t] + interestPaid[t]);

            netCashChange[t] = operatingCashFlow[t] + financingCashFlow[t];
            currentCash += netCashChange[t];
            endingCashBalance[t] = currentCash;

            // Inventarios valorizados
            finishedGoodsInv[t] = projections.FinishedGoodsInventory.Sum(fg => fg.FinalStockValuation[t]);
            rawMaterialsInv[t] = projections.RawMaterialsInventory.Sum(rm => rm.FinalStockValuation[t]);

            currentAssets[t] = endingCashBalance[t] + accountsReceivable[t] + finishedGoodsInv[t] + rawMaterialsInv[t];

            grossFixedAssets[t] = totalFixedAssetsCost;
            accumulatedDeprec[t] = Math.Min(totalFixedAssetsCost, annualDepreciation * (t + 1));
            netFixedAssets[t] = Math.Max(0m, grossFixedAssets[t] - accumulatedDeprec[t]);

            totalAssets[t] = currentAssets[t] + netFixedAssets[t];

            // Pasivos
            decimal debtEnding = projections.DebtSchedule[t].FinalBalance;
            shortTermDebt[t] = t + 1 < 5 ? projections.DebtSchedule[t + 1].PrincipalPayment : debtEnding;
            longTermDebt[t] = Math.Max(0m, debtEnding - shortTermDebt[t]);
            currentLiabilities[t] = accountsPayable[t] + shortTermDebt[t];
            totalLiabilities[t] = accountsPayable[t] + debtEnding;

            // Patrimonio
            initialEquity[t] = equityCapital;
            currentRetainedEarnings += incomeStatement.NetIncome[t];
            retainedEarnings[t] = currentRetainedEarnings;
            totalEquity[t] = initialEquity[t] + retainedEarnings[t];

            totalLiabEquity[t] = totalLiabilities[t] + totalEquity[t];
            isBalanced[t] = Math.Abs(totalAssets[t] - totalLiabEquity[t]) < 1.0m;
        }

        var cashFlow = new CashFlowStatementDto(
            0m, cashCollections, supplierPayments, payroll.TotalPayrollExpense,
            incomeStatement.OperatingExpenses, incomeStatement.SalesCommissions,
            incomeStatement.IncomeTax, operatingCashFlow, totalInitialInvestment,
            new decimal[5], principalRepayments, interestPaid, financingCashFlow,
            netCashChange, endingCashBalance
        );

        var balanceSheet = new BalanceSheetDto(
            endingCashBalance, accountsReceivable, finishedGoodsInv, rawMaterialsInv, currentAssets,
            grossFixedAssets, accumulatedDeprec, netFixedAssets, totalAssets,
            accountsPayable, shortTermDebt, currentLiabilities,
            longTermDebt, totalLiabilities,
            initialEquity, retainedEarnings, totalEquity, totalLiabEquity, isBalanced
        );

        return (cashFlow, balanceSheet);
    }

    private static FinancialRatiosDto CalculateFinancialRatios(IncomeStatementDto isState, BalanceSheetDto bs)
    {
        var cr = new decimal[5];
        var qr = new decimal[5];
        var nwc = new decimal[5];
        var dr = new decimal[5];
        var de = new decimal[5];
        var gm = new decimal[5];
        var om = new decimal[5];
        var nm = new decimal[5];
        var roa = new decimal[5];
        var roe = new decimal[5];

        for (int t = 0; t < 5; t++)
        {
            // Liquidez
            cr[t] = bs.TotalCurrentLiabilities[t] > 0 ? Math.Round(bs.TotalCurrentAssets[t] / bs.TotalCurrentLiabilities[t], 2) : 0m;
            decimal nonInventoryAssets = bs.Cash[t] + bs.AccountsReceivable[t];
            qr[t] = bs.TotalCurrentLiabilities[t] > 0 ? Math.Round(nonInventoryAssets / bs.TotalCurrentLiabilities[t], 2) : 0m;
            nwc[t] = bs.TotalCurrentAssets[t] - bs.TotalCurrentLiabilities[t];

            // Endeudamiento
            dr[t] = bs.TotalAssets[t] > 0 ? Math.Round((bs.TotalLiabilities[t] / bs.TotalAssets[t]) * 100.0m, 2) : 0m;
            de[t] = bs.TotalEquity[t] > 0 ? Math.Round((bs.TotalLiabilities[t] / bs.TotalEquity[t]), 2) : 0m;

            // Rentabilidad
            gm[t] = isState.Revenues[t] > 0 ? Math.Round((isState.GrossProfit[t] / isState.Revenues[t]) * 100.0m, 2) : 0m;
            om[t] = isState.Revenues[t] > 0 ? Math.Round((isState.OperatingIncome[t] / isState.Revenues[t]) * 100.0m, 2) : 0m;
            nm[t] = isState.Revenues[t] > 0 ? Math.Round((isState.NetIncome[t] / isState.Revenues[t]) * 100.0m, 2) : 0m;
            roa[t] = bs.TotalAssets[t] > 0 ? Math.Round((isState.NetIncome[t] / bs.TotalAssets[t]) * 100.0m, 2) : 0m;
            roe[t] = bs.TotalEquity[t] > 0 ? Math.Round((isState.NetIncome[t] / bs.TotalEquity[t]) * 100.0m, 2) : 0m;
        }

        return new FinancialRatiosDto(cr, qr, nwc, dr, de, gm, om, nm, roa, roe);
    }

    private static FeasibilityEvaluationDto CalculateFeasibility(
        decimal initialInvestment,
        IncomeStatementDto isState,
        decimal[] depreciation,
        List<MacroeconomicParameter> macroParams)
    {
        var fcl = new decimal[5];
        decimal waccRate = macroParams[0].WACC / 100.0m;
        decimal tmarRate = macroParams[0].TMAR / 100.0m;

        // FCL = NOPAT (Utilidad Operativa * (1 - T)) + Depreciación
        for (int t = 0; t < 5; t++)
        {
            decimal taxRate = macroParams[t].IncomeTaxRate / 100.0m;
            decimal nopat = isState.OperatingIncome[t] * (1.0m - taxRate);
            fcl[t] = Math.Round(nopat + depreciation[t], 2);
        }

        // VPN = -I0 + Sum( FCL_t / (1 + WACC)^t )
        decimal npv = -initialInvestment;
        for (int t = 0; t < 5; t++)
        {
            double discountFactor = Math.Pow((double)(1.0m + waccRate), t + 1);
            npv += fcl[t] / (decimal)discountFactor;
        }
        npv = Math.Round(npv, 2);

        // TIR mediante aproximación por bisección numérica
        decimal irr = ComputeIrr(initialInvestment, fcl);

        bool isViable = npv > 0 && irr >= tmarRate;
        string verdict = isViable
            ? "PROYECTO FINANCIERAMENTE VIABLE"
            : "PROYECTO NO VIABLE (El rendimiento no supera el costo de oportunidad ni la tasa de corte)";

        return new FeasibilityEvaluationDto(
            initialInvestment, fcl, macroParams[0].WACC, macroParams[0].TMAR,
            npv, Math.Round(irr * 100.0m, 2), isViable, verdict
        );
    }

    private static decimal ComputeIrr(decimal initialOutflow, decimal[] cashFlows)
    {
        double low = -0.9999;
        double high = 5.0; // Hasta 500%
        double tolerance = 0.00001;
        int maxIterations = 100;

        for (int iter = 0; iter < maxIterations; iter++)
        {
            double mid = (low + high) / 2.0;
            double npvMid = -(double)initialOutflow;

            for (int t = 0; t < cashFlows.Length; t++)
            {
                npvMid += (double)cashFlows[t] / Math.Pow(1.0 + mid, t + 1);
            }

            if (Math.Abs(npvMid) < tolerance)
                return (decimal)mid;

            if (npvMid > 0)
                low = mid;
            else
                high = mid;
        }

        return (decimal)((low + high) / 2.0);
    }
}