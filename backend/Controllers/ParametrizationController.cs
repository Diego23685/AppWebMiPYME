using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/business-plans/{planId}/[controller]")]
[Authorize]
public class ParametrizationController : ControllerBase
{
    private readonly AppDbContext _context;

    public ParametrizationController(AppDbContext context)
    {
        _context = context;
    }

    // --- RF09: Parámetros Salariales y Directrices ---
    [HttpGet("settings")]
    public async Task<ActionResult<SettingsDto>> GetSettings(int planId)
    {
        var s = await _context.BusinessPlanSettings.FindAsync(planId);
        if (s == null) return NotFound();

        return Ok(new SettingsDto(
            s.MarketArea, s.MonthlyPayrollExpense, s.EmployerTaxRate, s.InatecTaxRate,
            s.ChristmasBonusRate, s.SeveranceRate, s.VacationRate, s.OtherProvisionsRate,
            s.StartYear, s.CollectionDays, s.SupplierPaymentDays, s.DebtTermYears, s.SalesCommissionRate
        ));
    }

    [HttpPut("settings")]
    public async Task<IActionResult> SaveSettings(int planId, [FromBody] SettingsDto dto)
    {
        var s = await _context.BusinessPlanSettings.FindAsync(planId);
        if (s == null)
        {
            s = new BusinessPlanSetting { BusinessPlanId = planId };
            _context.BusinessPlanSettings.Add(s);
        }

        s.MarketArea = dto.MarketArea;
        s.MonthlyPayrollExpense = dto.MonthlyPayrollExpense;
        s.EmployerTaxRate = dto.EmployerTaxRate;
        s.InatecTaxRate = dto.InatecTaxRate;
        s.ChristmasBonusRate = dto.ChristmasBonusRate;
        s.SeveranceRate = dto.SeveranceRate;
        s.VacationRate = dto.VacationRate;
        s.OtherProvisionsRate = dto.OtherProvisionsRate;
        s.StartYear = dto.StartYear;
        s.CollectionDays = dto.CollectionDays;
        s.SupplierPaymentDays = dto.SupplierPaymentDays;
        s.DebtTermYears = dto.DebtTermYears;
        s.SalesCommissionRate = dto.SalesCommissionRate;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- RF10: Catálogo de Productos ---
    [HttpGet("products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(int planId)
    {
        var list = await _context.Products
            .Where(p => p.BusinessPlanId == planId)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.BaseYearDemand, p.AnnualGrowthRate, p.TargetPriceCostRatio, p.FinishedGoodsInventoryDays, p.BatchSize))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("products")]
    public async Task<IActionResult> AddProduct(int planId, [FromBody] ProductDto dto)
    {
        var p = new Product
        {
            BusinessPlanId = planId,
            Name = dto.Name,
            Description = dto.Description,
            BaseYearDemand = dto.BaseYearDemand,
            AnnualGrowthRate = dto.AnnualGrowthRate,
            TargetPriceCostRatio = dto.TargetPriceCostRatio,
            FinishedGoodsInventoryDays = dto.FinishedGoodsInventoryDays,
            BatchSize = dto.BatchSize
        };
        _context.Products.Add(p);
        await _context.SaveChangesAsync();
        return Ok(p.Id);
    }

    // --- RF11: Materias Primas ---
    [HttpGet("raw-materials")]
    public async Task<ActionResult<IEnumerable<RawMaterialDto>>> GetRawMaterials(int planId)
    {
        var list = await _context.RawMaterials
            .Where(rm => rm.BusinessPlanId == planId)
            .Select(rm => new RawMaterialDto(rm.Id, rm.Description, rm.UnitOfMeasure, rm.UnitCost, rm.RawMaterialInventoryDays))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("raw-materials")]
    public async Task<IActionResult> AddRawMaterial(int planId, [FromBody] RawMaterialDto dto)
    {
        var rm = new RawMaterial
        {
            BusinessPlanId = planId,
            Description = dto.Description,
            UnitOfMeasure = dto.UnitOfMeasure,
            UnitCost = dto.UnitCost,
            RawMaterialInventoryDays = dto.RawMaterialInventoryDays
        };
        _context.RawMaterials.Add(rm);
        await _context.SaveChangesAsync();
        return Ok(rm.Id);
    }

    // --- RF12: Macroeconómicos Quinquenales ---
    [HttpGet("macro-parameters")]
    public async Task<ActionResult<IEnumerable<MacroParamDto>>> GetMacroParameters(int planId)
    {
        var list = await _context.MacroeconomicParameters
            .Where(m => m.BusinessPlanId == planId)
            .OrderBy(m => m.YearIndex)
            .Select(m => new MacroParamDto(m.YearIndex, m.InflationRate, m.GdpGrowthRate, m.ReferenceInterestRate, m.RiskFreeRate, m.IncomeTaxRate, m.ProjectRiskPremium, m.TMAR, m.WACC))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPut("macro-parameters")]
    public async Task<IActionResult> SaveMacroParameters(int planId, [FromBody] List<MacroParamDto> dtoList)
    {
        var existing = await _context.MacroeconomicParameters.Where(m => m.BusinessPlanId == planId).ToListAsync();
        _context.MacroeconomicParameters.RemoveRange(existing);

        foreach (var dto in dtoList)
        {
            _context.MacroeconomicParameters.Add(new MacroeconomicParameter
            {
                BusinessPlanId = planId,
                YearIndex = dto.YearIndex,
                InflationRate = dto.InflationRate,
                GdpGrowthRate = dto.GdpGrowthRate,
                ReferenceInterestRate = dto.ReferenceInterestRate,
                RiskFreeRate = dto.RiskFreeRate,
                IncomeTaxRate = dto.IncomeTaxRate,
                ProjectRiskPremium = dto.ProjectRiskPremium,
                TMAR = dto.TMAR,
                WACC = dto.WACC
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- RF14: Gastos Operacionales ---
    [HttpGet("operational-expenses")]
    public async Task<ActionResult<IEnumerable<OperationalExpenseDto>>> GetExpenses(int planId)
    {
        var list = await _context.OperationalExpenses
            .Where(oe => oe.BusinessPlanId == planId)
            .Select(oe => new OperationalExpenseDto(oe.Id, oe.Concept, oe.Year1, oe.Year2, oe.Year3, oe.Year4, oe.Year5))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("operational-expenses")]
    public async Task<IActionResult> AddExpense(int planId, [FromBody] OperationalExpenseDto dto)
    {
        var oe = new OperationalExpense
        {
            BusinessPlanId = planId,
            Concept = dto.Concept,
            Year1 = dto.Year1,
            Year2 = dto.Year2,
            Year3 = dto.Year3,
            Year4 = dto.Year4,
            Year5 = dto.Year5
        };
        _context.OperationalExpenses.Add(oe);
        await _context.SaveChangesAsync();
        return Ok(oe.Id);
    }

    // --- RF15: Inversiones y Activos ---
    [HttpGet("assets")]
    public async Task<ActionResult<IEnumerable<AssetInvestmentDto>>> GetAssets(int planId)
    {
        var list = await _context.AssetInvestments
            .Where(ai => ai.BusinessPlanId == planId)
            .Select(ai => new AssetInvestmentDto(ai.Id, ai.Name, ai.Category, ai.Unit, ai.Quantity, ai.UnitValue, ai.UsefulLifeYears))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("assets")]
    public async Task<IActionResult> AddAsset(int planId, [FromBody] AssetInvestmentDto dto)
    {
        var ai = new AssetInvestment
        {
            BusinessPlanId = planId,
            Name = dto.Name,
            Category = dto.Category,
            Unit = dto.Unit,
            Quantity = dto.Quantity,
            UnitValue = dto.UnitValue,
            UsefulLifeYears = dto.UsefulLifeYears
        };
        _context.AssetInvestments.Add(ai);
        await _context.SaveChangesAsync();
        return Ok(ai.Id);
    }
}