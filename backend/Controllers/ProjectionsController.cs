using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/business-plans/{planId}/[controller]")]
[Authorize]
public class ProjectionsController : ControllerBase
{
    private readonly IProjectionEngineService _engineService;

    public ProjectionsController(IProjectionEngineService engineService)
    {
        _engineService = engineService;
    }

    [HttpGet]
    public async Task<ActionResult<FullProjectionSummaryDto>> GetProjections(int planId)
    {
        try
        {
            var result = await _engineService.CalculateProjectionsAsync(planId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}