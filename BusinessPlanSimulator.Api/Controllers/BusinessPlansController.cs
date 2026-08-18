using System.Security.Claims;
using BusinessPlanSimulator.Application.DTOs.BusinessPlans;
using BusinessPlanSimulator.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusinessPlansController : ControllerBase
{
    private readonly IBusinessPlanService _planService;

    public BusinessPlansController(IBusinessPlanService planService)
    {
        _planService = planService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Create([FromBody] CreateBusinessPlanDto dto)
    {
        try
        {
            var result = await _planService.CreatePlanAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _planService.GetPlanByIdAsync(id, GetUserId(), GetUserRole());
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("my-plans")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyPlans()
    {
        var result = await _planService.GetPlansByStudentAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("bank")]
    public async Task<IActionResult> GetBankProjects()
    {
        var result = await _planService.GetBankProjectsAsync();
        return Ok(result);
    }

    [HttpGet("course/{courseId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetCoursePlans(Guid courseId)
    {
        try
        {
            var result = await _planService.GetPlansByCourseAsync(courseId, GetUserId());
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("{id}/export/excel")]
    public async Task<IActionResult> ExportExcel(Guid id, [FromServices] IReportExportService exportService)
    {
        try
        {
            var plan = await _planService.GetPlanByIdAsync(id, GetUserId(), GetUserRole());
            var fileBytes = exportService.ExportPlanToExcel(plan);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{plan.Title}_Plan.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/export/pdf")]
    public async Task<IActionResult> ExportPdf(Guid id, [FromServices] IReportExportService exportService)
    {
        try
        {
            var plan = await _planService.GetPlanByIdAsync(id, GetUserId(), GetUserRole());
            var fileBytes = exportService.ExportPlanToPdf(plan);
            return File(fileBytes, "application/pdf", $"{plan.Title}_Plan.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBusinessPlanDto dto)
    {
        try
        {
            var result = await _planService.UpdatePlanAsync(id, GetUserId(), dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _planService.DeletePlanAsync(id, GetUserId(), GetUserRole());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/grade")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GradePlan(Guid id, [FromBody] GradeBusinessPlanDto dto)
    {
        try
        {
            var result = await _planService.GradePlanAsync(id, GetUserId(), dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}