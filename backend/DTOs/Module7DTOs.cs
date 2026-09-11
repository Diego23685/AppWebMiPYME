using System.ComponentModel.DataAnnotations;

namespace BusinessPlanSimulator.Api.DTOs;

public record CreateReviewNoteDto(
    [Required, MaxLength(100)] string SectionName,
    [Required] string Comment
);

public record ReviewNoteResponseDto(
    int Id,
    int BusinessPlanId,
    int ReviewerUserId,
    string ReviewerName,
    string SectionName,
    string Comment,
    bool IsResolved,
    DateTime CreatedAt
);

public record AuditLogDto(
    int Id,
    int? UserId,
    string? UserEmail,
    string Action,
    string EntityName,
    string EntityId,
    string Details,
    string IpAddress,
    DateTime Timestamp
);