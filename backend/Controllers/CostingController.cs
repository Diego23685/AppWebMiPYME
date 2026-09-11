using BusinessPlanSimulator.Api.Data;
using BusinessPlanSimulator.Api.DTOs;
using BusinessPlanSimulator.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/products/{productId}/[controller]")]
[Authorize]
public class CostingController : ControllerBase
{
    private readonly AppDbContext _context;

    public CostingController(AppDbContext context)
    {
        _context = context;
    }

    // RF16, RF17, RF18: Resumen consolidado del costo de lote y unitario
    [HttpGet("summary")]
    public async Task<ActionResult<BatchCostSummaryDto>> GetCostSummary(int productId)
    {
        var product = await _context.Products
            .Include(p => p.BillOfMaterials)
                .ThenInclude(b => b.RawMaterial)
            .Include(p => p.Overheads)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null) return NotFound(new { message = "Producto no encontrado" });

        var materials = product.BillOfMaterials.Select(b => new BomItemResponseDto(
            b.Id,
            b.RawMaterialId,
            b.RawMaterial.Description,
            b.RawMaterial.UnitOfMeasure,
            b.RawMaterial.UnitCost,
            b.QuantityPerBatch,
            Math.Round(b.RawMaterial.UnitCost * b.QuantityPerBatch, 4)
        )).ToList();

        var overheads = product.Overheads.Select(o => new OverheadResponseDto(
            o.Id,
            o.Concept,
            o.UnitOfMeasure,
            o.UnitCost,
            o.QuantityPerBatch,
            Math.Round(o.UnitCost * o.QuantityPerBatch, 4)
        )).ToList();

        decimal directMaterialsTotal = materials.Sum(m => m.PartialCost);
        decimal overheadTotal = overheads.Sum(o => o.PartialCost);
        decimal totalBatchCost = directMaterialsTotal + overheadTotal;
        decimal unitCost = product.BatchSize > 0 
            ? Math.Round(totalBatchCost / product.BatchSize, 4) 
            : 0;

        return Ok(new BatchCostSummaryDto(
            product.Id,
            product.Name,
            product.BatchSize,
            directMaterialsTotal,
            overheadTotal,
            totalBatchCost,
            unitCost,
            materials,
            overheads
        ));
    }

    // RF16: Asignar insumo / materia prima al lote
    [HttpPost("materials")]
    public async Task<IActionResult> AddMaterial(int productId, [FromBody] AddBomItemDto dto)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists) return NotFound(new { message = "Producto no encontrado" });

        var material = await _context.RawMaterials.FindAsync(dto.RawMaterialId);
        if (material == null) return NotFound(new { message = "Materia prima no encontrada" });

        var item = new ProductBOM
        {
            ProductId = productId,
            RawMaterialId = dto.RawMaterialId,
            QuantityPerBatch = dto.QuantityPerBatch
        };

        _context.ProductBOMs.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item.Id);
    }

    [HttpDelete("materials/{bomId}")]
    public async Task<IActionResult> RemoveMaterial(int productId, int bomId)
    {
        var item = await _context.ProductBOMs.FirstOrDefaultAsync(b => b.Id == bomId && b.ProductId == productId);
        if (item == null) return NotFound();

        _context.ProductBOMs.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // RF17: Asignar Costos Indirectos de Fabricación (CIF)
    [HttpPost("overheads")]
    public async Task<IActionResult> AddOverhead(int productId, [FromBody] AddOverheadDto dto)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists) return NotFound(new { message = "Producto no encontrado" });

        var overhead = new ProductOverhead
        {
            ProductId = productId,
            Concept = dto.Concept,
            UnitOfMeasure = dto.UnitOfMeasure,
            UnitCost = dto.UnitCost,
            QuantityPerBatch = dto.QuantityPerBatch
        };

        _context.ProductOverheads.Add(overhead);
        await _context.SaveChangesAsync();

        return Ok(overhead.Id);
    }

    [HttpDelete("overheads/{overheadId}")]
    public async Task<IActionResult> RemoveOverhead(int productId, int overheadId)
    {
        var item = await _context.ProductOverheads.FirstOrDefaultAsync(o => o.Id == overheadId && o.ProductId == productId);
        if (item == null) return NotFound();

        _context.ProductOverheads.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}