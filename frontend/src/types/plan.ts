export interface Macroplan {
  id: number;
  title: string;
  description: string;
  validityStartDate: string;
  validityEndDate: string;
  createdByUserId: number;
  createdByName: string;
  businessPlansCount: number;
  createdAt: string;
}

export interface BusinessPlan {
  id: number;
  macroplanId: number;
  macroplanTitle: string;
  authorUserId: number;
  authorName: string;
  companyName: string;
  taxId: string;
  companyType: string;
  sector: string;
  location: string;
  lifespanYears: number;
  createdAt: string;
  updatedAt?: string;
}