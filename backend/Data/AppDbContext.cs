using Microsoft.EntityFrameworkCore;
using BusinessPlanSimulator.Api.Models.Entities;

namespace BusinessPlanSimulator.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Macroplan> Macroplans => Set<Macroplan>();
    public DbSet<BusinessPlan> BusinessPlans => Set<BusinessPlan>();
    public DbSet<BusinessPlanSetting> BusinessPlanSettings => Set<BusinessPlanSetting>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<RawMaterial> RawMaterials => Set<RawMaterial>();
    public DbSet<MacroeconomicParameter> MacroeconomicParameters => Set<MacroeconomicParameter>();
    public DbSet<OperationalExpense> OperationalExpenses => Set<OperationalExpense>();
    public DbSet<AssetInvestment> AssetInvestments => Set<AssetInvestment>();
    public DbSet<ProductBOM> ProductBOMs => Set<ProductBOM>();
    public DbSet<ProductOverhead> ProductOverheads => Set<ProductOverhead>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<PlanReviewNote> PlanReviewNotes => Set<PlanReviewNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índices únicos
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Filtro global para Soft Delete (RF04)
        modelBuilder.Entity<Macroplan>()
            .HasQueryFilter(m => !m.IsDeleted);

        modelBuilder.Entity<BusinessPlan>()
            .HasQueryFilter(bp => !bp.IsDeleted);

        // Filtros coordinados para dependientes
        modelBuilder.Entity<BusinessPlanSetting>()
            .HasQueryFilter(s => !s.BusinessPlan.IsDeleted);

        modelBuilder.Entity<Product>()
            .HasQueryFilter(p => !p.BusinessPlan.IsDeleted);

        modelBuilder.Entity<RawMaterial>()
            .HasQueryFilter(rm => !rm.BusinessPlan.IsDeleted);

        modelBuilder.Entity<MacroeconomicParameter>()
            .HasQueryFilter(mp => !mp.BusinessPlan.IsDeleted);

        modelBuilder.Entity<OperationalExpense>()
            .HasQueryFilter(oe => !oe.BusinessPlan.IsDeleted);

        modelBuilder.Entity<AssetInvestment>()
            .HasQueryFilter(ai => !ai.BusinessPlan.IsDeleted);

        modelBuilder.Entity<ProductBOM>()
            .HasQueryFilter(b => !b.Product.BusinessPlan.IsDeleted);

        modelBuilder.Entity<ProductOverhead>()
            .HasQueryFilter(o => !o.Product.BusinessPlan.IsDeleted);

        // Relaciones
        modelBuilder.Entity<Macroplan>()
            .HasOne(m => m.CreatedByUser)
            .WithMany(u => u.Macroplans)
            .HasForeignKey(m => m.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BusinessPlan>()
            .HasOne(bp => bp.AuthorUser)
            .WithMany(u => u.BusinessPlans)
            .HasForeignKey(bp => bp.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BusinessPlan>()
            .HasOne(bp => bp.Macroplan)
            .WithMany(m => m.BusinessPlans)
            .HasForeignKey(bp => bp.MacroplanId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BusinessPlanSetting>()
            .HasOne(s => s.BusinessPlan)
            .WithOne()
            .HasForeignKey<BusinessPlanSetting>(s => s.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.BusinessPlan)
            .WithMany()
            .HasForeignKey(p => p.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RawMaterial>()
            .HasOne(rm => rm.BusinessPlan)
            .WithMany()
            .HasForeignKey(rm => rm.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MacroeconomicParameter>()
            .HasOne(mp => mp.BusinessPlan)
            .WithMany()
            .HasForeignKey(mp => mp.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OperationalExpense>()
            .HasOne(oe => oe.BusinessPlan)
            .WithMany()
            .HasForeignKey(oe => oe.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssetInvestment>()
            .HasOne(ai => ai.BusinessPlan)
            .WithMany()
            .HasForeignKey(ai => ai.BusinessPlanId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductBOM>()
                .HasOne(b => b.Product)
                .WithMany(p => p.BillOfMaterials)
                .HasForeignKey(b => b.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductBOM>()
                .HasOne(b => b.RawMaterial)
                .WithMany()
                .HasForeignKey(b => b.RawMaterialId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductOverhead>()
                .HasOne(o => o.Product)
                .WithMany(p => p.Overheads)
                .HasForeignKey(o => o.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

                modelBuilder.Entity<AuditLog>()
                    .HasOne(a => a.User)
                    .WithMany()
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.SetNull);

                modelBuilder.Entity<PlanReviewNote>()
                    .HasOne(n => n.BusinessPlan)
                    .WithMany()
                    .HasForeignKey(n => n.BusinessPlanId)
                    .OnDelete(DeleteBehavior.Cascade);

                modelBuilder.Entity<PlanReviewNote>()
                    .HasOne(n => n.ReviewerUser)
                    .WithMany()
                    .HasForeignKey(n => n.ReviewerUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<PlanReviewNote>()
                    .HasQueryFilter(n => !n.BusinessPlan.IsDeleted);
    }
}