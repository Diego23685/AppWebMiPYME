using BusinessPlanSimulator.Application.DTOs.Financial;
using BusinessPlanSimulator.Application.Interfaces;

namespace BusinessPlanSimulator.Application.Services;

public class FinancialCalculatorService : IFinancialCalculatorService
{
    public SimulationResultDto RunSimulation(FinancialInputDto input)
    {
        var statements = new List<YearFinancialStatementDto>();
        var cashFlows = new List<decimal> { -(input.InitialInvestment + input.WorkingCapital) };

        foreach (var p in input.Projections.OrderBy(x => x.Year))
        {
            var revenue = p.UnitsSold * p.UnitPrice;
            var varCosts = p.UnitsSold * p.UnitCost;
            var grossMargin = revenue - varCosts;
            var ebit = grossMargin - p.FixedOperatingCosts - p.AnnualDepreciation;
            
            var taxes = ebit > 0 ? ebit * input.IncomeTaxRate : 0m;
            var netIncome = ebit - taxes;
            var opCashFlow = netIncome + p.AnnualDepreciation;
            
            // En el año 5 se recupera el capital de trabajo
            var fcf = (p.Year == 5) ? opCashFlow + input.WorkingCapital : opCashFlow;

            statements.Add(new YearFinancialStatementDto(
                p.Year,
                revenue,
                varCosts,
                grossMargin,
                p.FixedOperatingCosts,
                p.AnnualDepreciation,
                ebit,
                taxes,
                netIncome,
                opCashFlow,
                fcf
            ));

            cashFlows.Add(fcf);
        }

        // Cálculos de Rentabilidad y Viabilidad
        var van = CalculateVan(input.DiscountRate, cashFlows);
        var tir = CalculateTir(cashFlows);
        var payback = CalculatePaybackPeriod(input.InitialInvestment + input.WorkingCapital, cashFlows.Skip(1).ToList());

        // Ratios Año 1
        var y1 = statements.First();
        var contributionMarginUnit = input.Projections.First().UnitPrice - input.Projections.First().UnitCost;
        var breakEvenUnits = contributionMarginUnit > 0 
            ? (input.Projections.First().FixedOperatingCosts + input.Projections.First().AnnualDepreciation) / contributionMarginUnit 
            : 0m;

        var ratios = new FinancialRatiosDto(
            GrossMarginPercentage: y1.Revenue > 0 ? (y1.GrossMargin / y1.Revenue) * 100m : 0m,
            NetMarginPercentage: y1.Revenue > 0 ? (y1.NetIncome / y1.Revenue) * 100m : 0m,
            ReturnOnInvestment: input.InitialInvestment > 0 ? (y1.NetIncome / input.InitialInvestment) * 100m : 0m,
            BreakEvenPointUnits: Math.Round(breakEvenUnits, 2)
        );

        return new SimulationResultDto(
            Van: Math.Round(van, 2),
            Tir: Math.Round(tir * 100m, 2),
            PaybackPeriodYears: Math.Round(payback, 2),
            IsViable: van > 0,
            IncomeStatements: statements,
            Year1Ratios: ratios
        );
    }

    private decimal CalculateVan(decimal rate, List<decimal> cashFlows)
    {
        decimal van = cashFlows[0];
        for (int t = 1; t < cashFlows.Count; t++)
        {
            var factor = (decimal)Math.Pow((double)(1m + rate), t);
            van += cashFlows[t] / factor;
        }
        return van;
    }

    // Cálculo de TIR mediante aproximación numérica Newton-Raphson
    private decimal CalculateTir(List<decimal> cashFlows, decimal guess = 0.1m)
    {
        decimal rate = guess;
        int maxIterations = 1000;
        double tolerance = 1e-5;

        for (int i = 0; i < maxIterations; i++)
        {
            double npv = 0.0;
            double dNpv = 0.0;

            for (int t = 0; t < cashFlows.Count; t++)
            {
                double cf = (double)cashFlows[t];
                double denom = Math.Pow(1.0 + (double)rate, t);
                npv += cf / denom;
                if (t > 0)
                {
                    dNpv -= t * cf / Math.Pow(1.0 + (double)rate, t + 1);
                }
            }

            if (Math.Abs(dNpv) < 1e-10) break;

            decimal newRate = rate - (decimal)(npv / dNpv);

            if (Math.Abs((double)(newRate - rate)) < tolerance)
            {
                return newRate;
            }

            rate = newRate;
        }

        return rate;
    }

    private decimal CalculatePaybackPeriod(decimal initialInvestment, List<decimal> yearlyCashFlows)
    {
        decimal accumulated = 0m;
        for (int i = 0; i < yearlyCashFlows.Count; i++)
        {
            if (accumulated + yearlyCashFlows[i] >= initialInvestment)
            {
                decimal remaining = initialInvestment - accumulated;
                return i + (remaining / yearlyCashFlows[i]);
            }
            accumulated += yearlyCashFlows[i];
        }
        return yearlyCashFlows.Count; // Si no se recupera en los 5 años
    }
}