using BusinessPlanSimulator.Application.DTOs.Courses;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface ICourseService
{
    Task<CourseResponseDto> CreateCourseAsync(Guid teacherId, CreateCourseDto dto);
    Task<List<CourseResponseDto>> GetCoursesByTeacherAsync(Guid teacherId);
    Task<List<CourseResponseDto>> GetCoursesByStudentAsync(Guid studentId);
    Task<bool> EnrollStudentAsync(Guid courseId, Guid teacherId, EnrollStudentDto dto);
    Task<List<StudentSummaryDto>> GetEnrolledStudentsAsync(Guid courseId, Guid teacherId);
    Task<bool> DeleteCourseAsync(Guid courseId, Guid teacherId);
}