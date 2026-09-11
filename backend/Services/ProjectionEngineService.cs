using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Services;

public interface IProjectionEngineService
{
    Task<FullProjectionSummaryDto> CalculateProjectionsAsync(int businessPlanId);
}

public class ProjectionEngineService : IProjectionEngineService
{
    private readonly AppDbContext _context;

    public ProjectionEngineService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FullProjectionSummaryDto> CalculateProjectionsAsync(int businessPlanId)
    {
        var plan = await _context.BusinessPlans
            .Include(bp => bp.Macroplan)
            .FirstOrDefaultAsync(bp => bp.Id == businessPlanId);

        if (plan == null)
            throw new InvalidOperationException("Plan de negocio no encontrado.");

        var settings = await _context.BusinessPlanSettings.FirstOrDefaultAsync(s => s.BusinessPlanId == businessPlanId)
            ?? throw new InvalidOperationException("Debe parametrizar los datos básicos y directrices (RF09).");

        var macroParams = await _context.MacroeconomicParameters
            .Where(m => m.BusinessPlanId == businessPlanId)
            .OrderBy(m => m.YearIndex)
            .ToListAsync();

        if (macroParams.Count < 5)
            throw new InvalidOperationException("Se requieren parámetros macroeconómicos para los 5 años (RF12).");

        var products = await _context.Products
            .Include(p => p.BillOfMaterials)
                .ThenInclude(b => b.RawMaterial)
            .Include(p => p.Overheads)
            .Where(p => p.BusinessPlanId == businessPlanId)
            .ToListAsync();

        if (!products.Any())
            throw new InvalidOperationException("Debe registrar al menos un producto (RF10).");

        var rawMaterials = await _context.RawMaterials
            .Where(rm => rm.BusinessPlanId == businessPlanId)
            .ToListAsync();

        var assets = await _context.AssetInvestments
            .Where(a => a.BusinessPlanId == businessPlanId)
            .ToListAsync();

        // -------------------------------------------------------------
        // 1. Proyecciones Comerciales y Costos Base por Producto
        // -------------------------------------------------------------
        var salesList = new List<ProductSalesProjectionDto>();
        var finishedGoodsList = new List<FinishedGoodsInventoryDto>();
        var consolidatedRevenues = new decimal[5];

        // Matriz de consumo de materia prima por año [rawMaterialId, yearIndex (0-4)]
        var rawMaterialConsumption = new Dictionary<int, decimal[]>();
        foreach (var rm in rawMaterials)
        {
            rawMaterialConsumption[rm.Id] = new decimal[5];
        }

        foreach (var prod in products)
        {
            var demand = new int[5];
            var sellingPrices = new decimal[5];
            var totalRevenues = new decimal[5];

            // Costo unitario base año 1 calculado desde lote
            decimal directMatsBatch = prod.BillOfMaterials.Sum(b => b.QuantityPerBatch * b.RawMaterial.UnitCost);
            decimal overheadBatch = prod.Overheads.Sum(o => o.QuantityPerBatch * o.UnitCost);
            decimal baseBatchCost = directMatsBatch + overheadBatch;
            decimal baseUnitCost = prod.BatchSize > 0 ? baseBatchCost / prod.BatchSize : 0;

            // Arrays de inventario PT
            var initialStock = new int[5];
            var productionRequired = new int[5];
            var totalAvailable = new int[5];
            var finalStock = new int[5];
            var unitCosts = new decimal[5];
            var stockValuation = new decimal[5];

            decimal inflationFactor = 1.0m;

            for (int t = 0; t < 5; t++)
            {
                // Indexación de inflación anual
                decimal inflationYear = macroParams[t].InflationRate / 100.0m;
                inflationFactor *= (1.0m + inflationYear);

                // Proyección de demanda
                if (t == 0)
                {
                    demand[t] = prod.BaseYearDemand;
                }
                else
                {
                    decimal growth = prod.AnnualGrowthRate / 100.0m;
                    demand[t] = (int)Math.Round(demand[t - 1] * (1.0m + growth));
                }

                // Costo unitario indexado
                unitCosts[t] = Math.Round(baseUnitCost * inflationFactor, 4);

                // Precio de venta = Costo Unitario * Relación Precio/Costo
                sellingPrices[t] = Math.Round(unitCosts[t] * prod.TargetPriceCostRatio, 2);
                totalRevenues[t] = Math.Round(demand[t] * sellingPrices[t], 2);
                consolidatedRevenues[t] += totalRevenues[t];

                // Dinámica de inventarios PT (RF21)
                initialStock[t] = t == 0 ? 0 : finalStock[t - 1];

                // Política de inventario: Stock de seguridad proporcional a días de política
                finalStock[t] = (int)Math.Ceiling(demand[t] * (prod.FinishedGoodsInventoryDays / 365.0m));

                // Producción requerida = Ventas + Stock Final - Stock Inicial
                productionRequired[t] = Math.Max(0, demand[t] + finalStock[t] - initialStock[t]);
                totalAvailable[t] = initialStock[t] + productionRequired[t];
                stockValuation[t] = Math.Round(finalStock[t] * unitCosts[t], 2);

                // Consumo de materia prima para esta producción
                if (prod.BatchSize > 0)
                {
                    decimal batchesNeeded = (decimal)productionRequired[t] / prod.BatchSize;
                    foreach (var bom in prod.BillOfMaterials)
                    {
                        rawMaterialConsumption[bom.RawMaterialId][t] += batchesNeeded * bom.QuantityPerBatch;
                    }
                }
            }

            salesList.Add(new ProductSalesProjectionDto(prod.Id, prod.Name, demand, sellingPrices, totalRevenues));
            finishedGoodsList.Add(new FinishedGoodsInventoryDto(
                prod.Id, prod.Name, initialStock, productionRequired, totalAvailable, demand, finalStock, unitCosts, stockValuation
            ));
        }

        // -------------------------------------------------------------
        // 2. Dinámica de Inventario de Materias Primas (RF22)
        // -------------------------------------------------------------
        var rawMaterialsList = new List<RawMaterialInventoryDto>();

        foreach (var rm in rawMaterials)
        {
            var initStock = new decimal[5];
            var consumption = rawMaterialConsumption[rm.Id];
            var desiredFinalStock = new decimal[5];
            var purchases = new decimal[5];
            var indexedCosts = new decimal[5];
            var purchasesCost = new decimal[5];
            var valuation = new decimal[5];

            decimal inflationFactor = 1.0m;

            for (int t = 0; t < 5; t++)
            {
                decimal inflationYear = macroParams[t].InflationRate / 100.0m;
                inflationFactor *= (1.0m + inflationYear);
                indexedCosts[t] = Math.Round(rm.UnitCost * inflationFactor, 4);

                initStock[t] = t == 0 ? 0 : desiredFinalStock[t - 1];

                // Política de inventario en días sobre el consumo del año
                desiredFinalStock[t] = Math.Round(consumption[t] * (rm.RawMaterialInventoryDays / 365.0m), 2);

                // Compras = Consumo + Stock Final - Stock Inicial
                purchases[t] = Math.Max(0, consumption[t] + desiredFinalStock[t] - initStock[t]);
                purchasesCost[t] = Math.Round(purchases[t] * indexedCosts[t], 2);
                valuation[t] = Math.Round(desiredFinalStock[t] * indexedCosts[t], 2);
            }

            rawMaterialsList.Add(new RawMaterialInventoryDto(
                rm.Id, rm.Description, rm.UnitOfMeasure, initStock, consumption, desiredFinalStock,
                purchases, indexedCosts, purchasesCost, valuation
            ));
        }

        // -------------------------------------------------------------
        // 3. Tabla de Amortización de Deuda (RF20)
        // -------------------------------------------------------------
        var debtSchedule = new List<DebtAmortizationScheduleDto>();
        decimal totalInvestments = assets.Sum(a => a.Quantity * a.UnitValue);

        // Supuesto de estructura financiera: 40% apalancamiento mediante deuda (o según directriz)
        decimal totalDebtFinanced = Math.Round(totalInvestments * 0.40m, 2);
        int termYears = Math.Max(1, settings.DebtTermYears);
        decimal marketRate = (macroParams[0].ReferenceInterestRate / 100.0m);

        decimal currentBalance = totalDebtFinanced;

        // Cuota fija (Método Francés): R = P * [ i / (1 - (1+i)^-n) ]
        decimal annuity = 0m;
        if (marketRate > 0 && currentBalance > 0)
        {
            double r = (double)marketRate;
            double factor = r / (1.0 - Math.Pow(1.0 + r, -termYears));
            annuity = Math.Round(totalDebtFinanced * (decimal)factor, 2);
        }

        for (int t = 1; t <= 5; t++)
        {
            if (t <= termYears && currentBalance > 0)
            {
                decimal interest = Math.Round(currentBalance * marketRate, 2);
                decimal principal = Math.Min(currentBalance, annuity - interest);
                decimal finalBalance = Math.Max(0, currentBalance - principal);

                debtSchedule.Add(new DebtAmortizationScheduleDto(
                    t, currentBalance, interest, principal, interest + principal, finalBalance
                ));

                currentBalance = finalBalance;
            }
            else
            {
                debtSchedule.Add(new DebtAmortizationScheduleDto(t, 0, 0, 0, 0, 0));
            }
        }

        return new FullProjectionSummaryDto(
            salesList,
            consolidatedRevenues,
            finishedGoodsList,
            rawMaterialsList,
            debtSchedule,
            totalDebtFinanced
        );
    }
}