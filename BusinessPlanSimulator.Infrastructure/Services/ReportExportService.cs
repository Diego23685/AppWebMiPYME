using System.IO;
using ClosedXML.Excel;
using BusinessPlanSimulator.Application.DTOs.BusinessPlans;
using BusinessPlanSimulator.Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BusinessPlanSimulator.Infrastructure.Services;

public class ReportExportService : IReportExportService
{
    public byte[] ExportPlanToExcel(BusinessPlanResponseDto plan)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Plan Financiero");

        // Encabezados Generales
        ws.Cell(1, 1).Value = "PLAN DE NEGOCIOS:";
        ws.Cell(1, 2).Value = plan.Title;
        ws.Cell(2, 1).Value = "EMPRESA / SECTOR:";
        ws.Cell(2, 2).Value = $"{plan.CompanyName} ({plan.Sector})";
        ws.Cell(3, 1).Value = "ESTUDIANTE / CURSO:";
        ws.Cell(3, 2).Value = $"{plan.StudentName} / {plan.CourseName}";
        ws.Cell(4, 1).Value = "ESTADO / CALIFICACIÓN:";
        ws.Cell(4, 2).Value = $"{plan.Status} - {(plan.Grade.HasValue ? plan.Grade + "/100" : "Sin calificar")}";

        // Dictamen y Ratios
        if (plan.SimulationResult != null)
        {
            ws.Cell(6, 1).Value = "VAN ($)";
            ws.Cell(6, 2).Value = plan.SimulationResult.Van;
            ws.Cell(7, 1).Value = "TIR (%)";
            ws.Cell(7, 2).Value = plan.SimulationResult.Tir;
            ws.Cell(8, 1).Value = "Payback (Años)";
            ws.Cell(8, 2).Value = plan.SimulationResult.PaybackPeriodYears;
            ws.Cell(9, 1).Value = "Dictamen";
            ws.Cell(9, 2).Value = plan.SimulationResult.IsViable ? "VIABLE" : "NO VIABLE";

            // Tabla de Proyecciones a 5 Años
            ws.Cell(11, 1).Value = "Año";
            ws.Cell(11, 2).Value = "Ingresos ($)";
            ws.Cell(11, 3).Value = "Costos Var. ($)";
            ws.Cell(11, 4).Value = "Margen Bruto ($)";
            ws.Cell(11, 5).Value = "Costos Fijos ($)";
            ws.Cell(11, 6).Value = "Utilidad Neta ($)";
            ws.Cell(11, 7).Value = "Flujo Libre ($)";

            int row = 12;
            foreach (var st in plan.SimulationResult.IncomeStatements)
            {
                ws.Cell(row, 1).Value = $"Año {st.Year}";
                ws.Cell(row, 2).Value = st.Revenue;
                ws.Cell(row, 3).Value = st.VariableCosts;
                ws.Cell(row, 4).Value = st.GrossMargin;
                ws.Cell(row, 5).Value = st.OperatingCosts;
                ws.Cell(row, 6).Value = st.NetIncome;
                ws.Cell(row, 7).Value = st.FreeCashFlow;
                row++;
            }
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportPlanToPdf(BusinessPlanResponseDto plan)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Text($"Dictamen Financiero: {plan.Title}")
                    .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    col.Item().Text($"Empresa: {plan.CompanyName} | Sector: {plan.Sector}").Bold();
                    col.Item().Text($"Estudiante: {plan.StudentName} | Curso: {plan.CourseName}");
                    col.Item().Text($"Estado: {plan.Status} | Calificación: {(plan.Grade.HasValue ? plan.Grade + "/100" : "N/A")}");

                    if (!string.IsNullOrEmpty(plan.TeacherFeedback))
                    {
                        col.Item().Background(Colors.Grey.Lighten3).Padding(5)
                            .Text($"Retroalimentación Docente: {plan.TeacherFeedback}").Italic();
                    }

                    if (plan.SimulationResult != null)
                    {
                        col.Item().PaddingTop(10).Text("Resumen de Viabilidad Financiera").Bold().FontSize(12);
                        col.Item().Text($"• VAN: ${plan.SimulationResult.Van:N2}");
                        col.Item().Text($"• TIR: {plan.SimulationResult.Tir:N2}%");
                        col.Item().Text($"• Retorno de Inversión (Payback): {plan.SimulationResult.PaybackPeriodYears} años");
                        col.Item().Text($"• Dictamen Final: {(plan.SimulationResult.IsViable ? "PROYECTO VIABLE" : "PROYECTO NO VIABLE")}")
                            .Bold().FontColor(plan.SimulationResult.IsViable ? Colors.Green.Medium : Colors.Red.Medium);

                        col.Item().PaddingTop(10).Text("Estado de Resultados Proyectado (5 Años)").Bold().FontSize(12);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Año").Bold();
                                header.Cell().Text("Ingresos").Bold();
                                header.Cell().Text("C. Variables").Bold();
                                header.Cell().Text("Utilidad Neta").Bold();
                                header.Cell().Text("Flujo Libre").Bold();
                            });

                            foreach (var item in plan.SimulationResult.IncomeStatements)
                            {
                                table.Cell().Text($"Año {item.Year}");
                                table.Cell().Text($"${item.Revenue:N0}");
                                table.Cell().Text($"${item.VariableCosts:N0}");
                                table.Cell().Text($"${item.NetIncome:N0}");
                                table.Cell().Text($"${item.FreeCashFlow:N0}");
                            }
                        });
                    }
                });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Generado por Simulador de Planes de Negocio - Página ");
                        x.CurrentPageNumber();
                    });
            });
        });

        return document.GeneratePdf();
    }
}