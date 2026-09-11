using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.DTOs;

// Macroplanes
public record CreateMacroplanDto(
    [Required, MaxLength(200)] string Title,
    string Description,
    [Required] DateTime ValidityStartDate,
    [Required] DateTime ValidityEndDate
);

public record UpdateMacroplanDto(
    [Required, MaxLength(200)] string Title,
    string Description,
    DateTime ValidityStartDate,
    DateTime ValidityEndDate
);

public record MacroplanResponseDto(
    int Id,
    string Title,
    string Description,
    DateTime ValidityStartDate,
    DateTime ValidityEndDate,
    int CreatedByUserId,
    string CreatedByName,
    int BusinessPlansCount,
    DateTime CreatedAt
);

// Planes de Negocio
public record CreateBusinessPlanDto(
    [Required] int MacroplanId,
    [Required, MaxLength(200)] string CompanyName,
    [Required, MaxLength(50)] string TaxId,
    [MaxLength(100)] string CompanyType,
    [MaxLength(100)] string Sector,
    string Location,
    [Range(1, 10)] int LifespanYears
);

public record UpdateBusinessPlanDto(
    [Required, MaxLength(200)] string CompanyName,
    [Required, MaxLength(50)] string TaxId,
    [MaxLength(100)] string CompanyType,
    [MaxLength(100)] string Sector,
    string Location,
    [Range(1, 10)] int LifespanYears
);

public record BusinessPlanResponseDto(
    int Id,
    int MacroplanId,
    string MacroplanTitle,
    int AuthorUserId,
    string AuthorName,
    string CompanyName,
    string TaxId,
    string CompanyType,
    string Sector,
    string Location,
    int LifespanYears,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);