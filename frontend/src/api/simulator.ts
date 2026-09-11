import { apiClient } from './client';

export interface SettingsData {
  marketArea: string;
  monthlyPayrollExpense: number;
  employerTaxRate: number;
  inatecTaxRate: number;
  christmasBonusRate: number;
  severanceRate: number;
  vacationRate: number;
  otherProvisionsRate: number;
  startYear: number;
  collectionDays: number;
  supplierPaymentDays: number;
  debtTermYears: number;
  salesCommissionRate: number;
}

export interface MacroParamData {
  yearIndex: number;
  inflationRate: number;
  gdpGrowthRate: number;
  referenceInterestRate: number;
  riskFreeRate: number;
  incomeTaxRate: number;
  projectRiskPremium: number;
  tmar: number;
  wacc: number;
}

export interface FullFinancialReport {
  payroll: {
    baseSalaries: number[];
    employerTax: number[];
    inatecTax: number[];
    christmasBonus: number[];
    severanceProvision: number[];
    vacationProvision: number[];
    totalPayrollExpense: number[];
  };
  incomeStatement: {
    revenues: number[];
    costOfGoodsSold: number[];
    grossProfit: number[];
    operatingExpenses: number[];
    salesCommissions: number[];
    payrollExpense: number[];
    depreciationExpense: number[];
    operatingIncome: number[];
    interestExpense: number[];
    preTaxIncome: number[];
    incomeTax: number[];
    netIncome: number[];
  };
  balanceSheet: {
    cash: number[];
    accountsReceivable: number[];
    finishedGoodsInventory: number[];
    rawMaterialsInventory: number[];
    totalCurrentAssets: number[];
    netFixedAssets: number[];
    totalAssets: number[];
    totalCurrentLiabilities: number[];
    totalLiabilities: number[];
    totalEquity: number[];
    totalLiabilitiesAndEquity: number[];
    isBalanced: boolean[];
  };
  feasibility: {
    initialInvestment: number;
    freeCashFlows: number[];
    discountRateWacc: number;
    tmar: number;
    netPresentValue: number;
    internalRateOfReturn: number;
    isViable: boolean;
    feasibilityVerdict: string;
  };
}

export const getSettings = async (planId: number): Promise<SettingsData> => {
  const res = await apiClient.get<SettingsData>(`/business-plans/${planId}/parametrization/settings`);
  return res.data;
};

export const saveSettings = async (planId: number, data: SettingsData): Promise<void> => {
  await apiClient.put(`/business-plans/${planId}/parametrization/settings`, data);
};

export const getMacroParams = async (planId: number): Promise<MacroParamData[]> => {
  const res = await apiClient.get<MacroParamData[]>(`/business-plans/${planId}/parametrization/macro-parameters`);
  return res.data;
};

export const saveMacroParams = async (planId: number, data: MacroParamData[]): Promise<void> => {
  await apiClient.put(`/business-plans/${planId}/parametrization/macro-parameters`, data);
};

export const getFinancialReport = async (planId: number): Promise<FullFinancialReport> => {
  const res = await apiClient.get<FullFinancialReport>(`/business-plans/${planId}/financials/report`);
  return res.data;
};

export const downloadExcelReport = async (planId: number, companyName: string): Promise<void> => {
  const res = await apiClient.get(`/support/business-plans/${planId}/export-excel`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Reporte_${companyName.replace(/\s+/g, '_')}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};