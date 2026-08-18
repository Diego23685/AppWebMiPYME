namespace BusinessPlanSimulator.Application.DTOs.Courses;

public record CreateCourseDto(string Name, string Code, string Description);
public record EnrollStudentDto(Guid StudentId);

public record CourseResponseDto(
    Guid Id,
    string Name,
    string Code,
    string Description,
    Guid TeacherId,
    string TeacherName,
    int EnrolledStudentsCount,
    DateTime CreatedAtUtc
);

public record StudentSummaryDto(
    Guid Id,
    string FullName,
    string Email,
    DateTime EnrolledAtUtc
);