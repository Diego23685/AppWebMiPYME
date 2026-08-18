using BusinessPlanSimulator.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlanSimulator.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<BusinessPlan> BusinessPlans => Set<BusinessPlan>();
    public DbSet<FinancialAssumption> FinancialAssumptions => Set<FinancialAssumption>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Filtros globales para Soft Delete
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Course>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<CourseEnrollment>().HasQueryFilter(ce => !ce.Course.IsDeleted && !ce.Student.IsDeleted);
        modelBuilder.Entity<BusinessPlan>().HasQueryFilter(b => !b.IsDeleted);
        modelBuilder.Entity<FinancialAssumption>().HasQueryFilter(f => !f.IsDeleted);

        // Configuración de User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
        });

        // Configuración de Course
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Code).IsRequired().HasMaxLength(50);

            entity.HasOne(c => c.Teacher)
                  .WithMany(u => u.TeachingCourses)
                  .HasForeignKey(c => c.TeacherId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración de CourseEnrollment (Llave compuesta N:M)
        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasKey(ce => new { ce.CourseId, ce.StudentId });

            entity.HasOne(ce => ce.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(ce => ce.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ce => ce.Student)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(ce => ce.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración de BusinessPlan
        modelBuilder.Entity<BusinessPlan>(entity =>
        {
            entity.HasKey(bp => bp.Id);
            entity.Property(bp => bp.Title).IsRequired().HasMaxLength(250);
            entity.Property(bp => bp.CompanyName).IsRequired().HasMaxLength(200);
            entity.Property(bp => bp.Sector).HasMaxLength(100);
            entity.Property(bp => bp.Grade).HasPrecision(5, 2);

            entity.HasOne(bp => bp.Student)
                  .WithMany(u => u.BusinessPlans)
                  .HasForeignKey(bp => bp.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(bp => bp.Course)
                  .WithMany(c => c.BusinessPlans)
                  .HasForeignKey(bp => bp.CourseId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración de FinancialAssumption (Relación 1 a 1 y precisión decimal)
        modelBuilder.Entity<FinancialAssumption>(entity =>
        {
            entity.HasKey(fa => fa.Id);

            entity.Property(fa => fa.InflationRate).HasPrecision(5, 4);
            entity.Property(fa => fa.IncomeTaxRate).HasPrecision(5, 4);
            entity.Property(fa => fa.DiscountRate).HasPrecision(5, 4);
            entity.Property(fa => fa.InitialInvestment).HasPrecision(18, 2);
            entity.Property(fa => fa.WorkingCapital).HasPrecision(18, 2);

            // Mapeo JSON para PostgreSQL
            entity.Property(fa => fa.ProjectionsJson).HasColumnType("jsonb");

            entity.HasOne(fa => fa.BusinessPlan)
                  .WithOne(bp => bp.FinancialAssumption)
                  .HasForeignKey<FinancialAssumption>(fa => fa.BusinessPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    // Interceptor para actualizar UpdatedAtUtc automáticamente
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}