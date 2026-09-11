using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/business-plans/{planId}/[controller]")]
[Authorize]
public class FinancialsController : ControllerBase
{
    private readonly IFinancialStatementService _financialService;

    public FinancialsController(IFinancialStatementService financialService)
    {
        _financialService = financialService;
    }

    [HttpGet("report")]
    public async Task<ActionResult<FullFinancialReportDto>> GetFullReport(int planId)
    {
        try
        {
            var report = await _financialService.GenerateFinancialReportAsync(planId);
            return Ok(report);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}