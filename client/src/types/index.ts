export type UserRole = 'Admin' | 'Teacher' | 'Student';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface AnnualProjectionInput {
  year: number;
  unitsSold: number;
  unitPrice: number;
  unitCost: number;
  fixedOperatingCosts: number;
  annualDepreciation: number;
}

export interface FinancialInput {
  initialInvestment: number;
  workingCapital: number;
  discountRate: number;
  incomeTaxRate: number;
  inflationRate: number;
  projections: AnnualProjectionInput[];
}

export interface YearFinancialStatement {
  year: number;
  revenue: number;
  variableCosts: number;
  grossMargin: number;
  operatingCosts: number;
  depreciation: number;
  ebit: number;
  taxes: number;
  netIncome: number;
  operatingCashFlow: number;
  freeCashFlow: number;
}

export interface SimulationResult {
  van: number;
  tir: number;
  paybackPeriodYears: number;
  isViable: boolean;
  incomeStatements: YearFinancialStatement[];
  year1Ratios: {
    grossMarginPercentage: number;
    netMarginPercentage: number;
    returnOnInvestment: number;
    breakEvenPointUnits: number;
  };
}

export interface BusinessPlan {
  id: string;
  title: string;
  companyName: string;
  companyType: string;
  marketArea: string;
  sector: string;
  description: string;
  legalMinimumWage: number;
  transportationAllowance: number;
  socialSecurityRate: number;
  payrollTaxRate: number;
  severanceAndBenefitsRate: number;
  startYear: number;
  accountsReceivableDays: number;
  accountsPayableDays: number;
  projectLifespanYears: number;
  debtRepaymentYears: number;
  salesCommissionRate: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  grade?: number;
  teacherFeedback?: string;
  financialData?: FinancialInput;
  simulationResult?: SimulationResult;
  createdAtUtc: string;
}