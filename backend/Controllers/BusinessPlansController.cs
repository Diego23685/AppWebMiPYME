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
public class BusinessPlansController : ControllerBase
{
    private readonly AppDbContext _context;

    public BusinessPlansController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BusinessPlanResponseDto>>> GetAll(
        [FromQuery] int? macroplanId,
        [FromQuery] string? sector,
        [FromQuery] string? search)
    {
        var query = _context.BusinessPlans
            .Include(bp => bp.Macroplan)
            .Include(bp => bp.AuthorUser)
            .AsNoTracking();

        if (macroplanId.HasValue)
            query = query.Where(bp => bp.MacroplanId == macroplanId.Value);

        if (!string.IsNullOrWhiteSpace(sector))
            query = query.Where(bp => bp.Sector == sector);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(bp => bp.CompanyName.Contains(search) || bp.TaxId.Contains(search));

        var list = await query
            .OrderByDescending(bp => bp.CreatedAt)
            .Select(bp => new BusinessPlanResponseDto(
                bp.Id,
                bp.MacroplanId,
                bp.Macroplan.Title,
                bp.AuthorUserId,
                bp.AuthorUser.FullName,
                bp.CompanyName,
                bp.TaxId,
                bp.CompanyType,
                bp.Sector,
                bp.Location,
                bp.LifespanYears,
                bp.CreatedAt,
                bp.UpdatedAt
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BusinessPlanResponseDto>> GetById(int id)
    {
        var bp = await _context.BusinessPlans
            .Include(x => x.Macroplan)
            .Include(x => x.AuthorUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (bp == null) return NotFound();

        return Ok(new BusinessPlanResponseDto(
            bp.Id, bp.MacroplanId, bp.Macroplan.Title, bp.AuthorUserId, bp.AuthorUser.FullName,
            bp.CompanyName, bp.TaxId, bp.CompanyType, bp.Sector, bp.Location,
            bp.LifespanYears, bp.CreatedAt, bp.UpdatedAt
        ));
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Secretario))]
    public async Task<IActionResult> Create([FromBody] CreateBusinessPlanDto dto)
    {
        var macroplanExists = await _context.Macroplans.AnyAsync(m => m.Id == dto.MacroplanId);
        if (!macroplanExists)
            return BadRequest(new { message = "El macroplan asociado no existe o no está activo" });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var businessPlan = new BusinessPlan
        {
            MacroplanId = dto.MacroplanId,
            AuthorUserId = userId,
            CompanyName = dto.CompanyName,
            TaxId = dto.TaxId,
            CompanyType = dto.CompanyType,
            Sector = dto.Sector,
            Location = dto.Location,
            LifespanYears = dto.LifespanYears,
            CreatedAt = DateTime.UtcNow
        };

        _context.BusinessPlans.Add(businessPlan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = businessPlan.Id }, businessPlan.Id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBusinessPlanDto dto)
    {
        var bp = await _context.BusinessPlans.FindAsync(id);
        if (bp == null) return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        // Solo el autor o un administrador pueden editar
        if (bp.AuthorUserId != userId && role != nameof(UserRole.Administrador))
            return Forbid();

        bp.CompanyName = dto.CompanyName;
        bp.TaxId = dto.TaxId;
        bp.CompanyType = dto.CompanyType;
        bp.Sector = dto.Sector;
        bp.Location = dto.Location;
        bp.LifespanYears = dto.LifespanYears;
        bp.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        var bp = await _context.BusinessPlans.FindAsync(id);
        if (bp == null) return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (bp.AuthorUserId != userId && role != nameof(UserRole.Administrador))
            return Forbid();

        bp.IsDeleted = true;
        bp.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}