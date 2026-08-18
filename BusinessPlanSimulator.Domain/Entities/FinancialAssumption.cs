namespace BusinessPlanSimulator.Domain.Entities;

public class FinancialAssumption : BaseEntity
{
    public Guid BusinessPlanId { get; set; }
    public BusinessPlan BusinessPlan { get; set; } = null!;

    // Entorno macroeconómico & Políticas (R1.9)
    public decimal InflationRate { get; set; }             // Tasa de inflación anual (%)
    public decimal IncomeTaxRate { get; set; }             // Tasa impuesto a la renta (%)
    public decimal DiscountRate { get; set; }              // Tasa de descuento / WACC (%)
    public int DaysSalesOutstanding { get; set; }          // Política de cobro (días)
    public int DaysPayableOutstanding { get; set; }        // Política de pago (días)

    // Datos de inversión inicial y proyección
    public decimal InitialInvestment { get; set; }         // Inversión fija + activos
    public decimal WorkingCapital { get; set; }            // Capital de trabajo inicial
    
    // Almacenamiento estructurado para detalles de proyección (Costos, proyección de ventas por año 1-5, etc.)
    // Usamos JSON estructurado para no crear 15 tablas pequeñas innecesarias en esta fase.
    public string ProjectionsJson { get; set; } = "{}";
}