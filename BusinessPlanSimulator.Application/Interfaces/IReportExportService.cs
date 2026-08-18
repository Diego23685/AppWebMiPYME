using BusinessPlanSimulator.Application.DTOs.BusinessPlans;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface IReportExportService
{
    byte[] ExportPlanToExcel(BusinessPlanResponseDto plan);
    byte[] ExportPlanToPdf(BusinessPlanResponseDto plan);
}