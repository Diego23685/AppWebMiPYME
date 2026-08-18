using BusinessPlanSimulator.Application.DTOs.Courses;
using BusinessPlanSimulator.Application.Interfaces;
using BusinessPlanSimulator.Domain.Entities;
using BusinessPlanSimulator.Domain.Enums;
using BusinessPlanSimulator.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;

    public CourseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourseResponseDto> CreateCourseAsync(Guid teacherId, CreateCourseDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId)
            ?? throw new UnauthorizedAccessException("Usuario no encontrado.");

        if (user.Role != UserRole.Teacher && user.Role != UserRole.Admin)
        {
            throw new UnauthorizedAccessException("El usuario no tiene permisos de docente o administrador.");
        }

        var course = new Course
        {
            Name = dto.Name.Trim(),
            Code = dto.Code.Trim().ToUpper(),
            Description = dto.Description.Trim(),
            TeacherId = teacherId
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return new CourseResponseDto(
            course.Id,
            course.Name,
            course.Code,
            course.Description,
            user.Id,
            $"{user.FirstName} {user.LastName}",
            0,
            course.CreatedAtUtc
        );
    }

    public async Task<List<CourseResponseDto>> GetCoursesByTeacherAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return new List<CourseResponseDto>();

        var query = _context.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .AsQueryable();

        // Si es docente, solo ve sus cursos. Si es Admin, ve todos.
        if (user.Role != UserRole.Admin)
        {
            query = query.Where(c => c.TeacherId == userId);
        }

        return await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .Select(c => new CourseResponseDto(
                c.Id,
                c.Name,
                c.Code,
                c.Description,
                c.TeacherId,
                c.Teacher != null ? $"{c.Teacher.FirstName} {c.Teacher.LastName}" : "Sin Asignar",
                c.Enrollments.Count,
                c.CreatedAtUtc
            ))
            .ToListAsync();
    }

    public async Task<List<CourseResponseDto>> GetCoursesByStudentAsync(Guid studentId)
    {
        return await _context.CourseEnrollments
            .Include(ce => ce.Course)
                .ThenInclude(c => c.Teacher)
            .Include(ce => ce.Course)
                .ThenInclude(c => c.Enrollments)
            .Where(ce => ce.StudentId == studentId)
            .OrderByDescending(ce => ce.Course.CreatedAtUtc)
            .Select(ce => new CourseResponseDto(
                ce.Course.Id,
                ce.Course.Name,
                ce.Course.Code,
                ce.Course.Description,
                ce.Course.TeacherId,
                ce.Course.Teacher != null ? $"{ce.Course.Teacher.FirstName} {ce.Course.Teacher.LastName}" : "Sin Asignar",
                ce.Course.Enrollments.Count,
                ce.Course.CreatedAtUtc
            ))
            .ToListAsync();
    }

    public async Task<bool> EnrollStudentAsync(Guid courseId, Guid userId, EnrollStudentDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Curso no encontrado.");

        if (user?.Role != UserRole.Admin && course.TeacherId != userId)
        {
            throw new UnauthorizedAccessException("No tienes permisos sobre este curso.");
        }

        var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student)
            ?? throw new KeyNotFoundException("Estudiante no encontrado.");

        var alreadyEnrolled = await _context.CourseEnrollments
            .AnyAsync(ce => ce.CourseId == courseId && ce.StudentId == dto.StudentId);

        if (alreadyEnrolled)
        {
            throw new InvalidOperationException("El estudiante ya está matriculado en este curso.");
        }

        _context.CourseEnrollments.Add(new CourseEnrollment
        {
            CourseId = courseId,
            StudentId = dto.StudentId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<StudentSummaryDto>> GetEnrolledStudentsAsync(Guid courseId, Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Curso no encontrado.");

        if (user?.Role != UserRole.Admin && course.TeacherId != userId)
        {
            throw new UnauthorizedAccessException("No tienes permisos sobre este curso.");
        }

        return await _context.CourseEnrollments
            .Where(ce => ce.CourseId == courseId)
            .Select(ce => new StudentSummaryDto(
                ce.Student.Id,
                $"{ce.Student.FirstName} {ce.Student.LastName}",
                ce.Student.Email,
                ce.EnrolledAtUtc
            ))
            .ToListAsync();
    }

    public async Task<bool> DeleteCourseAsync(Guid courseId, Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Curso no encontrado.");

        if (user?.Role != UserRole.Admin && course.TeacherId != userId)
        {
            throw new UnauthorizedAccessException("No tienes permisos sobre este curso.");
        }

        course.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}