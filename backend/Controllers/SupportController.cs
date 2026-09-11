using System.Security.Claims;
using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Models.Entities;
using BusinessPlanSimulator.Api.Models.Enums;
using BusinessPlanSimulator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFinancialStatementService _financialService;
    private readonly IExcelExportService _excelService;

    public SupportController(
        AppDbContext context,
        IFinancialStatementService financialService,
        IExcelExportService excelService)
    {
        _context = context;
        _financialService = financialService;
        _excelService = excelService;
    }

    // --- RF29: Observaciones y Retroalimentación (CU17) ---
    [HttpGet("business-plans/{planId}/notes")]
    public async Task<ActionResult<IEnumerable<ReviewNoteResponseDto>>> GetNotes(int planId)
    {
        var notes = await _context.PlanReviewNotes
            .Include(n => n.ReviewerUser)
            .Where(n => n.BusinessPlanId == planId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new ReviewNoteResponseDto(
                n.Id, n.BusinessPlanId, n.ReviewerUserId,
                n.ReviewerUser.FullName, n.SectionName, n.Comment,
                n.IsResolved, n.CreatedAt
            ))
            .ToListAsync();

        return Ok(notes);
    }

    [HttpPost("business-plans/{planId}/notes")]
    [Authorize(Roles = $"{nameof(UserRole.Gerente)},{nameof(UserRole.Administrador)}")]
    public async Task<IActionResult> AddNote(int planId, [FromBody] CreateReviewNoteDto dto)
    {
        var planExists = await _context.BusinessPlans.AnyAsync(bp => bp.Id == planId);
        if (!planExists) return NotFound(new { message = "Plan no encontrado" });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var note = new PlanReviewNote
        {
            BusinessPlanId = planId,
            ReviewerUserId = userId,
            SectionName = dto.SectionName,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.PlanReviewNotes.Add(note);
        await _context.SaveChangesAsync();

        return Ok(note.Id);
    }

    [HttpPatch("notes/{noteId}/resolve")]
    public async Task<IActionResult> ToggleResolveNote(int noteId)
    {
        var note = await _context.PlanReviewNotes.FindAsync(noteId);
        if (note == null) return NotFound();

        note.IsResolved = !note.IsResolved;
        note.ResolvedAt = note.IsResolved ? DateTime.UtcNow : null;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // --- RF30: Exportación de Reportes Ejecutivos en Excel (CU18) ---
    [HttpGet("business-plans/{planId}/export-excel")]
    public async Task<IActionResult> ExportExcel(int planId)
    {
        var plan = await _context.BusinessPlans.FindAsync(planId);
        if (plan == null) return NotFound(new { message = "Plan no encontrado" });

        var report = await _financialService.GenerateFinancialReportAsync(planId);
        var fileBytes = _excelService.ExportFullFinancialReport(plan.CompanyName, report);

        string fileName = $"ReporteFinanciero_{plan.CompanyName.Replace(" ", "_")}.xlsx";
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    // --- RF28: Trazabilidad y Auditoría (CU19) ---
    [HttpGet("audit-logs")]
    [Authorize(Roles = nameof(UserRole.Administrador))]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetLogs([FromQuery] string? entity)
    {
        var query = _context.AuditLogs.Include(a => a.User).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entity))
            query = query.Where(a => a.EntityName == entity);

        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Take(100)
            .Select(a => new AuditLogDto(
                a.Id, a.UserId, a.User != null ? a.User.Email : "Sistema",
                a.Action, a.EntityName, a.EntityId, a.Details, a.IpAddress, a.Timestamp
            ))
            .ToListAsync();

        return Ok(logs);
    }
}