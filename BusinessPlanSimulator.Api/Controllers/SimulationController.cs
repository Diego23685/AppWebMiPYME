using BusinessPlanSimulator.Application.DTOs.Financial;
using BusinessPlanSimulator.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SimulationController : ControllerBase
{
    private readonly IFinancialCalculatorService _calculatorService;

    public SimulationController(IFinancialCalculatorService calculatorService)
    {
        _calculatorService = calculatorService;
    }

    [HttpPost("calculate")]
    public IActionResult Calculate([FromBody] FinancialInputDto input)
    {
        if (input.Projections == null || input.Projections.Count != 5)
        {
            return BadRequest(new { message = "Se requieren exactamente 5 años de proyección." });
        }

        var result = _calculatorService.RunSimulation(input);
        return Ok(result);
    }
}