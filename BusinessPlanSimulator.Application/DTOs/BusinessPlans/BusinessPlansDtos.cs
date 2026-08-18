using BusinessPlanSimulator.Application.DTOs.Financial;
using BusinessPlanSimulator.Domain.Enums;

namespace BusinessPlanSimulator.Application.DTOs.BusinessPlans;

public record CreateBusinessPlanDto(
    string Title,
    string CompanyName,
    string CompanyType,
    string MarketArea,
    string Sector,
    string Description,
    decimal LegalMinimumWage,
    decimal TransportationAllowance,
    decimal SocialSecurityRate,
    decimal PayrollTaxRate,
    decimal SeveranceAndBenefitsRate,
    int StartYear,
    int AccountsReceivableDays,
    int AccountsPayableDays,
    int ProjectLifespanYears,
    int DebtRepaymentYears,
    decimal SalesCommissionRate,
    Guid CourseId,
    FinancialInputDto FinancialData
);

public record UpdateBusinessPlanDto(
    string Title,
    string CompanyName,
    string CompanyType,
    string MarketArea,
    string Sector,
    string Description,
    decimal LegalMinimumWage,
    decimal TransportationAllowance,
    decimal SocialSecurityRate,
    decimal PayrollTaxRate,
    decimal SeveranceAndBenefitsRate,
    int StartYear,
    int AccountsReceivableDays,
    int AccountsPayableDays,
    int ProjectLifespanYears,
    int DebtRepaymentYears,
    decimal SalesCommissionRate,
    FinancialInputDto FinancialData
);

public record GradeBusinessPlanDto(
    decimal Grade,
    string TeacherFeedback,
    PlanStatus Status
);

public record BusinessPlanResponseDto(
    Guid Id,
    string Title,
    string CompanyName,
    string CompanyType,
    string MarketArea,
    string Sector,
    string Description,
    decimal LegalMinimumWage,
    decimal TransportationAllowance,
    decimal SocialSecurityRate,
    decimal PayrollTaxRate,
    decimal SeveranceAndBenefitsRate,
    int StartYear,
    int AccountsReceivableDays,
    int AccountsPayableDays,
    int ProjectLifespanYears,
    int DebtRepaymentYears,
    decimal SalesCommissionRate,
    string Status,
    Guid StudentId,
    string StudentName,
    Guid CourseId,
    string CourseName,
    decimal? Grade,
    string? TeacherFeedback,
    FinancialInputDto? FinancialData,
    SimulationResultDto? SimulationResult,
    DateTime CreatedAtUtc
);