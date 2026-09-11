using System.Security.Claims;
using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Models.Entities;
using BusinessPlanSimulator.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MacroplansController : ControllerBase
{
    private readonly AppDbContext _context;

    public MacroplansController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MacroplanResponseDto>>> GetAll([FromQuery] string? search)
    {
        var query = _context.Macroplans
            .Include(m => m.CreatedByUser)
            .Include(m => m.BusinessPlans)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.Title.Contains(search) || m.Description.Contains(search));
        }

        var list = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MacroplanResponseDto(
                m.Id,
                m.Title,
                m.Description,
                m.ValidityStartDate,
                m.ValidityEndDate,
                m.CreatedByUserId,
                m.CreatedByUser.FullName,
                m.BusinessPlans.Count,
                m.CreatedAt
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MacroplanResponseDto>> GetById(int id)
    {
        var m = await _context.Macroplans
            .Include(m => m.CreatedByUser)
            .Include(m => m.BusinessPlans)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return NotFound();

        return Ok(new MacroplanResponseDto(
            m.Id, m.Title, m.Description, m.ValidityStartDate, m.ValidityEndDate,
            m.CreatedByUserId, m.CreatedByUser.FullName, m.BusinessPlans.Count, m.CreatedAt
        ));
    }

    [HttpPost]
    [Authorize(Roles = $"{nameof(UserRole.Gerente)},{nameof(UserRole.Administrador)}")]
    public async Task<IActionResult> Create([FromBody] CreateMacroplanDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var macroplan = new Macroplan
        {
            Title = dto.Title,
            Description = dto.Description,
            ValidityStartDate = dto.ValidityStartDate,
            ValidityEndDate = dto.ValidityEndDate,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Macroplans.Add(macroplan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = macroplan.Id }, macroplan.Id);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{nameof(UserRole.Gerente)},{nameof(UserRole.Administrador)}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMacroplanDto dto)
    {
        var macroplan = await _context.Macroplans.FindAsync(id);
        if (macroplan == null) return NotFound();

        macroplan.Title = dto.Title;
        macroplan.Description = dto.Description;
        macroplan.ValidityStartDate = dto.ValidityStartDate;
        macroplan.ValidityEndDate = dto.ValidityEndDate;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = $"{nameof(UserRole.Gerente)},{nameof(UserRole.Administrador)}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        var macroplan = await _context.Macroplans.FindAsync(id);
        if (macroplan == null) return NotFound();

        macroplan.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}