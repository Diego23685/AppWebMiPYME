using ClosedXML.Excel;
using BusinessPlanSimulator.Api.DTOs;

namespace BusinessPlanSimulator.Api.Services;

public interface IExcelExportService
{
    byte[] ExportFullFinancialReport(string companyName, FullFinancialReportDto report);
}

public class ExcelExportService : IExcelExportService
{
    public byte[] ExportFullFinancialReport(string companyName, FullFinancialReportDto report)
    {
        using var workbook = new XLWorkbook();

        // 1. Hoja: Estado de Resultados
        var wsIs = workbook.Worksheets.Add("Estado de Resultados");
        wsIs.Cell(1, 1).Value = $"Estado de Resultados - {companyName}";
        wsIs.Range(1, 1, 1, 6).Merge().Style.Font.SetBold().Font.SetFontSize(14);

        string[] headers = ["Rubro / Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"];
        for (int i = 0; i < headers.Length; i++)
            wsIs.Cell(3, i + 1).Value = headers[i];

        wsIs.Range(3, 1, 3, 6).Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightGray);

        int row = 4;
        AddRow(wsIs, row++, "Ingresos por Ventas", report.IncomeStatement.Revenues);
        AddRow(wsIs, row++, "Costo de Ventas (COGS)", report.IncomeStatement.CostOfGoodsSold);
        AddRow(wsIs, row++, "Utilidad Bruta", report.IncomeStatement.GrossProfit, isBold: true);
        AddRow(wsIs, row++, "Gastos Operacionales Fijos", report.IncomeStatement.OperatingExpenses);
        AddRow(wsIs, row++, "Comisiones de Venta", report.IncomeStatement.SalesCommissions);
        AddRow(wsIs, row++, "Gastos de Nómina Consolidada", report.IncomeStatement.PayrollExpense);
        AddRow(wsIs, row++, "Depreciación Anual", report.IncomeStatement.DepreciationExpense);
        AddRow(wsIs, row++, "Utilidad Operativa (EBIT)", report.IncomeStatement.OperatingIncome, isBold: true);
        AddRow(wsIs, row++, "Gastos Financieros (Intereses)", report.IncomeStatement.InterestExpense);
        AddRow(wsIs, row++, "Utilidad Antes de Impuestos (EBT)", report.IncomeStatement.PreTaxIncome);
        AddRow(wsIs, row++, "Impuesto sobre la Renta", report.IncomeStatement.IncomeTax);
        AddRow(wsIs, row++, "Utilidad Neta", report.IncomeStatement.NetIncome, isBold: true);

        wsIs.Columns().AdjustToContents();

        // 2. Hoja: Evaluación de Viabilidad
        var wsV = workbook.Worksheets.Add("Viabilidad y Métricas");
        wsV.Cell(1, 1).Value = $"Evaluación de Viabilidad - {companyName}";
        wsV.Range(1, 1, 1, 3).Merge().Style.Font.SetBold().Font.SetFontSize(14);

        wsV.Cell(3, 1).Value = "Inversión Inicial Requerida:";
        wsV.Cell(3, 2).Value = report.Feasibility.InitialInvestment;
        wsV.Cell(4, 1).Value = "Costo de Capital (WACC):";
        wsV.Cell(4, 2).Value = $"{report.Feasibility.DiscountRateWacc}%";
        wsV.Cell(5, 1).Value = "TMAR del Inversionista:";
        wsV.Cell(5, 2).Value = $"{report.Feasibility.Tmar}%";
        wsV.Cell(6, 1).Value = "Valor Presente Neto (VPN):";
        wsV.Cell(6, 2).Value = report.Feasibility.NetPresentValue;
        wsV.Cell(7, 1).Value = "Tasa Interna de Retorno (TIR):";
        wsV.Cell(7, 2).Value = $"{report.Feasibility.InternalRateOfReturn}%";
        wsV.Cell(8, 1).Value = "Dictamen Final:";
        wsV.Cell(8, 2).Value = report.Feasibility.FeasibilityVerdict;
        wsV.Cell(8, 2).Style.Font.SetBold();

        wsV.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void AddRow(IXLWorksheet ws, int row, string title, decimal[] values, bool isBold = false)
    {
        ws.Cell(row, 1).Value = title;
        for (int i = 0; i < values.Length; i++)
        {
            ws.Cell(row, i + 2).Value = values[i];
            ws.Cell(row, i + 2).Style.NumberFormat.Format = "$#,##0.00";
        }
        if (isBold) ws.Row(row).Style.Font.SetBold();
    }
}