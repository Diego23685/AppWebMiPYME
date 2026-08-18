using BusinessPlanSimulator.Domain.Enums;

namespace BusinessPlanSimulator.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Recuperación de credenciales (R1.3)
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpiresUtc { get; set; }

    // Relaciones
    public ICollection<Course> TeachingCourses { get; set; } = new List<Course>();
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public ICollection<BusinessPlan> BusinessPlans { get; set; } = new List<BusinessPlan>();
}