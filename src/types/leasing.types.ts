export interface LeasingAsset {
  id: string;
  title: string;
  description: string;
  image: string;
  roi: number;
  pricePerToken: number;
  totalTokens: number;
  minTokens: number;
  maxTokens: number;
  specifications: Specification[];
  company: ICompanyInfo;
  performanceMetrics: PerformanceMetrics;
  currentFunding: number;
  targetFunding: number;
}

export interface Specification {
  title: string;
  value: string;
}

export interface ICompanyInfo {
  name: string;
  creditRating: string;
  yearsInOperation: number;
  leasingContract: string;
}

export interface PerformanceMetrics {
  annualRate: number;
  riskLevel: {
    level: string;
    color: string;
  };
  riskPercentage: number;
  contractPeriod: string;
  totalReturn: string;
  liquidity: string;
}

export interface PurchaseState {
  selectedTokens: number;
  totalInvestment: number;
}

export type TabType = "details" | "finances";
