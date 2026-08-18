using BusinessPlanSimulator.Domain.Enums;

namespace BusinessPlanSimulator.Domain.Entities;

public class BusinessPlan : BaseEntity
{
    // 1.1.1 & 1.1.2 Datos de Empresa
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyType { get; set; } = string.Empty; // Tipo de sociedad (S.A.S, Ltda, etc.)
    public string MarketArea { get; set; } = string.Empty;  // Mercado / Área de influencia directa
    public string Sector { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // 1.1.4 a 1.1.8 Parámetros Laborales y Prestacionales
    public decimal LegalMinimumWage { get; set; }          // SMMLV
    public decimal TransportationAllowance { get; set; }   // Auxilio de transporte
    public decimal SocialSecurityRate { get; set; }        // Aportes seguridad social (ej: 0.205)
    public decimal PayrollTaxRate { get; set; }            // Aportes parafiscales (ej: 0.09)
    public decimal SeveranceAndBenefitsRate { get; set; }  // Prestaciones sociales (ej: 0.2183)

    // 1.1.9 a 1.1.13 Políticas Operativas y Financieras
    public int StartYear { get; set; }                     // Año de inicio de operaciones
    public int AccountsReceivableDays { get; set; }        // Política de cobro (días)
    public int AccountsPayableDays { get; set; }          // Política de pago proveedores MP (días)
    public int ProjectLifespanYears { get; set; } = 5;     // Vida útil del proyecto
    public int DebtRepaymentYears { get; set; }            // Plazo de pago obligaciones financieras
    public decimal SalesCommissionRate { get; set; }       // Comisiones por ventas (ej: 0.03 = 3%)

    // Auditoría y Estado
    public PlanStatus Status { get; set; } = PlanStatus.Draft;
    public decimal? Grade { get; set; }
    public string? TeacherFeedback { get; set; }
    public DateTime? EvaluatedAtUtc { get; set; }

    // Relaciones
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public FinancialAssumption? FinancialAssumption { get; set; }
}