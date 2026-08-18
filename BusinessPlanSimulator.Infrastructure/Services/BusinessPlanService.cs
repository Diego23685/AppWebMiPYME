using System.Text.Json;
using BusinessPlanSimulator.Application.DTOs.BusinessPlans;
using BusinessPlanSimulator.Application.DTOs.Financial;
using BusinessPlanSimulator.Application.Interfaces;
using BusinessPlanSimulator.Domain.Entities;
using BusinessPlanSimulator.Domain.Enums;
using BusinessPlanSimulator.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Infrastructure.Services;

public class BusinessPlanService : IBusinessPlanService
{
    private readonly ApplicationDbContext _context;
    private readonly IFinancialCalculatorService _calculatorService;

    public BusinessPlanService(ApplicationDbContext context, IFinancialCalculatorService calculatorService)
    {
        _context = context;
        _calculatorService = calculatorService;
    }

    public async Task<BusinessPlanResponseDto> CreatePlanAsync(Guid studentId, CreateBusinessPlanDto dto)
    {
        var isEnrolled = await _context.CourseEnrollments
            .AnyAsync(ce => ce.CourseId == dto.CourseId && ce.StudentId == studentId);

        if (!isEnrolled)
        {
            throw new UnauthorizedAccessException("El estudiante no está matriculado en este curso.");
        }

        var plan = new BusinessPlan
        {
            Title = dto.Title.Trim(),
            CompanyName = dto.CompanyName.Trim(),
            CompanyType = dto.CompanyType.Trim(),
            MarketArea = dto.MarketArea.Trim(),
            Sector = dto.Sector.Trim(),
            Description = dto.Description.Trim(),
            LegalMinimumWage = dto.LegalMinimumWage,
            TransportationAllowance = dto.TransportationAllowance,
            SocialSecurityRate = dto.SocialSecurityRate,
            PayrollTaxRate = dto.PayrollTaxRate,
            SeveranceAndBenefitsRate = dto.SeveranceAndBenefitsRate,
            StartYear = dto.StartYear,
            AccountsReceivableDays = dto.AccountsReceivableDays,
            AccountsPayableDays = dto.AccountsPayableDays,
            ProjectLifespanYears = dto.ProjectLifespanYears,
            DebtRepaymentYears = dto.DebtRepaymentYears,
            SalesCommissionRate = dto.SalesCommissionRate,
            StudentId = studentId,
            CourseId = dto.CourseId,
            Status = PlanStatus.Draft
        };

        var assumption = new FinancialAssumption
        {
            BusinessPlan = plan,
            InitialInvestment = dto.FinancialData.InitialInvestment,
            WorkingCapital = dto.FinancialData.WorkingCapital,
            DiscountRate = dto.FinancialData.DiscountRate,
            IncomeTaxRate = dto.FinancialData.IncomeTaxRate,
            InflationRate = dto.FinancialData.InflationRate,
            ProjectionsJson = JsonSerializer.Serialize(dto.FinancialData.Projections)
        };

        _context.BusinessPlans.Add(plan);
        _context.FinancialAssumptions.Add(assumption);
        await _context.SaveChangesAsync();

        return await MapToDtoAsync(plan.Id);
    }

    public async Task<BusinessPlanResponseDto> GetPlanByIdAsync(Guid planId, Guid currentUserId, string role)
    {
        var plan = await _context.BusinessPlans
            .Include(b => b.Student)
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .FirstOrDefaultAsync(b => b.Id == planId)
            ?? throw new KeyNotFoundException("Plan de negocio no encontrado.");

        if (role == UserRole.Student.ToString() && plan.StudentId != currentUserId && plan.Status != PlanStatus.Approved)
        {
            throw new UnauthorizedAccessException("No tienes permisos para visualizar este plan.");
        }

        return BuildResponse(plan);
    }

    public async Task<List<BusinessPlanResponseDto>> GetPlansByStudentAsync(Guid studentId)
    {
        var plans = await _context.BusinessPlans
            .Include(b => b.Student)
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .Where(b => b.StudentId == studentId)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync();

        return plans.Select(BuildResponse).ToList();
    }

    public async Task<List<BusinessPlanResponseDto>> GetPlansByCourseAsync(Guid courseId, Guid teacherId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId)
            ?? throw new UnauthorizedAccessException("No eres el docente de este curso.");

        var plans = await _context.BusinessPlans
            .Include(b => b.Student)
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .Where(b => b.CourseId == courseId)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync();

        return plans.Select(BuildResponse).ToList();
    }

    public async Task<List<BusinessPlanResponseDto>> GetBankProjectsAsync()
    {
        var approvedPlans = await _context.BusinessPlans
            .Include(b => b.Student)
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .Where(b => b.Status == PlanStatus.Approved)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync();

        return approvedPlans.Select(BuildResponse).ToList();
    }

    public async Task<BusinessPlanResponseDto> UpdatePlanAsync(Guid planId, Guid studentId, UpdateBusinessPlanDto dto)
    {
        var plan = await _context.BusinessPlans
            .Include(b => b.FinancialAssumption)
            .FirstOrDefaultAsync(b => b.Id == planId && b.StudentId == studentId)
            ?? throw new KeyNotFoundException("Plan de negocio no encontrado o no pertenece al estudiante.");

        if (plan.Status == PlanStatus.Approved)
        {
            throw new InvalidOperationException("No se puede editar un plan ya aprobado.");
        }

        plan.Title = dto.Title.Trim();
        plan.CompanyName = dto.CompanyName.Trim();
        plan.CompanyType = dto.CompanyType.Trim();
        plan.MarketArea = dto.MarketArea.Trim();
        plan.Sector = dto.Sector.Trim();
        plan.Description = dto.Description.Trim();
        plan.LegalMinimumWage = dto.LegalMinimumWage;
        plan.TransportationAllowance = dto.TransportationAllowance;
        plan.SocialSecurityRate = dto.SocialSecurityRate;
        plan.PayrollTaxRate = dto.PayrollTaxRate;
        plan.SeveranceAndBenefitsRate = dto.SeveranceAndBenefitsRate;
        plan.StartYear = dto.StartYear;
        plan.AccountsReceivableDays = dto.AccountsReceivableDays;
        plan.AccountsPayableDays = dto.AccountsPayableDays;
        plan.ProjectLifespanYears = dto.ProjectLifespanYears;
        plan.DebtRepaymentYears = dto.DebtRepaymentYears;
        plan.SalesCommissionRate = dto.SalesCommissionRate;

        if (plan.FinancialAssumption != null)
        {
            plan.FinancialAssumption.InitialInvestment = dto.FinancialData.InitialInvestment;
            plan.FinancialAssumption.WorkingCapital = dto.FinancialData.WorkingCapital;
            plan.FinancialAssumption.DiscountRate = dto.FinancialData.DiscountRate;
            plan.FinancialAssumption.IncomeTaxRate = dto.FinancialData.IncomeTaxRate;
            plan.FinancialAssumption.InflationRate = dto.FinancialData.InflationRate;
            plan.FinancialAssumption.ProjectionsJson = JsonSerializer.Serialize(dto.FinancialData.Projections);
        }

        await _context.SaveChangesAsync();
        return await MapToDtoAsync(plan.Id);
    }

    public async Task<bool> DeletePlanAsync(Guid planId, Guid currentUserId, string role)
    {
        var plan = await _context.BusinessPlans
            .Include(b => b.Course)
            .FirstOrDefaultAsync(b => b.Id == planId)
            ?? throw new KeyNotFoundException("Plan de negocio no encontrado.");

        bool canDelete = role == UserRole.Admin.ToString() 
            || (role == UserRole.Teacher.ToString() && plan.Course.TeacherId == currentUserId)
            || (role == UserRole.Student.ToString() && plan.StudentId == currentUserId && plan.Status == PlanStatus.Draft);

        if (!canDelete)
        {
            throw new UnauthorizedAccessException("No cuentas con permisos para eliminar este plan.");
        }

        plan.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BusinessPlanResponseDto> GradePlanAsync(Guid planId, Guid teacherId, GradeBusinessPlanDto dto)
    {
        var plan = await _context.BusinessPlans
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .FirstOrDefaultAsync(b => b.Id == planId && b.Course.TeacherId == teacherId)
            ?? throw new KeyNotFoundException("Plan no encontrado o no eres el titular de este curso.");

        plan.Grade = dto.Grade;
        plan.TeacherFeedback = dto.TeacherFeedback;
        plan.Status = dto.Status;
        plan.EvaluatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await MapToDtoAsync(plan.Id);
    }

    private async Task<BusinessPlanResponseDto> MapToDtoAsync(Guid planId)
    {
        var plan = await _context.BusinessPlans
            .Include(b => b.Student)
            .Include(b => b.Course)
            .Include(b => b.FinancialAssumption)
            .FirstAsync(b => b.Id == planId);

        return BuildResponse(plan);
    }

    private BusinessPlanResponseDto BuildResponse(BusinessPlan plan)
    {
        FinancialInputDto? finInput = null;
        SimulationResultDto? simResult = null;

        if (plan.FinancialAssumption != null)
        {
            var projections = JsonSerializer.Deserialize<List<AnnualProjectionInputDto>>(plan.FinancialAssumption.ProjectionsJson) 
                              ?? new List<AnnualProjectionInputDto>();

            finInput = new FinancialInputDto(
                plan.FinancialAssumption.InitialInvestment,
                plan.FinancialAssumption.WorkingCapital,
                plan.FinancialAssumption.DiscountRate,
                plan.FinancialAssumption.IncomeTaxRate,
                plan.FinancialAssumption.InflationRate,
                projections
            );

            if (projections.Count == 5)
            {
                simResult = _calculatorService.RunSimulation(finInput);
            }
        }

        return new BusinessPlanResponseDto(
            plan.Id,
            plan.Title,
            plan.CompanyName,
            plan.CompanyType,
            plan.MarketArea,
            plan.Sector,
            plan.Description,
            plan.LegalMinimumWage,
            plan.TransportationAllowance,
            plan.SocialSecurityRate,
            plan.PayrollTaxRate,
            plan.SeveranceAndBenefitsRate,
            plan.StartYear,
            plan.AccountsReceivableDays,
            plan.AccountsPayableDays,
            plan.ProjectLifespanYears,
            plan.DebtRepaymentYears,
            plan.SalesCommissionRate,
            plan.Status.ToString(),
            plan.StudentId,
            plan.Student != null ? $"{plan.Student.FirstName} {plan.Student.LastName}" : "N/A",
            plan.CourseId,
            plan.Course != null ? plan.Course.Name : "N/A",
            plan.Grade,
            plan.TeacherFeedback,
            finInput,
            simResult,
            plan.CreatedAtUtc
        );
    }
}