using BusinessPlanSimulator.Application.DTOs.BusinessPlans;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface IBusinessPlanService
{
    Task<BusinessPlanResponseDto> CreatePlanAsync(Guid studentId, CreateBusinessPlanDto dto);
    Task<BusinessPlanResponseDto> GetPlanByIdAsync(Guid planId, Guid currentUserId, string role);
    Task<List<BusinessPlanResponseDto>> GetPlansByStudentAsync(Guid studentId);
    Task<List<BusinessPlanResponseDto>> GetPlansByCourseAsync(Guid courseId, Guid teacherId);
    Task<List<BusinessPlanResponseDto>> GetBankProjectsAsync(); // Banco de proyectos aprobados (RF3)
    Task<BusinessPlanResponseDto> UpdatePlanAsync(Guid planId, Guid studentId, UpdateBusinessPlanDto dto);
    Task<bool> DeletePlanAsync(Guid planId, Guid currentUserId, string role);
    Task<BusinessPlanResponseDto> GradePlanAsync(Guid planId, Guid teacherId, GradeBusinessPlanDto dto);
}