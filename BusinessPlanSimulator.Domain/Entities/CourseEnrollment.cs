namespace BusinessPlanSimulator.Domain.Entities;

public class CourseEnrollment
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public DateTime EnrolledAtUtc { get; set; } = DateTime.UtcNow;
}