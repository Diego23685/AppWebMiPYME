namespace BusinessPlanSimulator.Domain.Entities;

public class Course : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Docente que administra el curso
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    // Relaciones
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public ICollection<BusinessPlan> BusinessPlans { get; set; } = new List<BusinessPlan>();
}