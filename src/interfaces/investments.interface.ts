export interface Asset {
  id: string;
  name: string;
  quantity: number;
  price: number;
  tokens: number;
  tokensAvailable: number;
  pricePerToken: number;
  description: string;
  type: string;
  contractTime: number;
  liquidity: string;
  coverImageUrl: string | null;
  miniatureImageUrl: string | null;
  discoverImageUrl: string | null;
  agreement: AgreementDto | null;
  company: CompanyDto | null;
  tir: number | null;
  active: boolean;
  contractAddress: string | null;
  details: AssetDetails[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AssetDetails {
  title: string;
  value: string;
}

export interface CommitFunds {
  token: string;
  sender: string;
  amount: number;
  deadline: number;
  totalTokens: number;
  permitSignature: {
    v: number;
    r: string;
    s: string;
  };
}

export interface ClaimRent {
  token: string;
  receiver: string;
  amount: number;
  deadline: number;
  permitSignature: {
    v: number;
    r: string;
    s: string;
  };
}

export interface CompanyDto {
  id: string;
  name: string;
  operationTime: number;
  operationMeasure: string;
  creditRating: string;
  leasingContract: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementDto {
  id: string;
  userId: string;
  leasingId: string;
  assetValue: number;
  usefulLife: number;
  termTime: number;
  paymentTerm: string;
  agreementType: number;
  currency: string;
  contractDetails: string;
  startDate: string;
  endDate: string;
  installmentRate: number;
  installmentAmount: number;
  managementFee: number;
  tokensPurchased: number;
  totalValue: number;
  remainingBalance: number;
  status: string;
  leasingCoreAddress: string;
  insurancePercentage: number;
  ibrRate: number;
  riskLevel: number;
  riskRate: number;
  iva: number;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  leasingId: string;
  amount: number;
  bricksCount: number;
  bricksName: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  paymentCount: number;
  leasing: Asset;
}

export interface PortfolioChartDto {
  asOf: string;
  currency: string;
  currentValue: number;
  /** Presente desde API actualizada; si falta se estima con currentValue - totalReturn. */
  totalInvested?: number;
  totalReturn: number;
  roi: number;
  chart: ChartData[];
  /** Proyección futura mes a mes: capital + intereses por activo (tasa individual TIR/12). */
  projectedChart?: ProjectionPointDto[];
}

export interface ProjectionPointDto {
  month: string;
  /** yyyy-MM desde API; evita etiquetas duplicadas (ej. dos "Ene"). */
  monthKey?: string;
  /** Número de mes desde inicio (1-based). */
  monthIndex: number;
  /** Capital total invertido (constante). */
  capital: number;
  /** Intereses acumulados hasta este mes. */
  interest: number;
  /** Capital + intereses acumulados. */
  projectedValue: number;
  /** Uso legado — flujo de capital regresado. */
  capitalReturned?: number;
}

interface ChartData {
  month: string;
  monthText: string;
  value: number;
  invested: number;
  return: number;
}
interface PortfolioData {
  month: string;
  projectedValue: number;
}

export interface AmortizationPeriod {
  month: number;
  monthLabel: string;
  installment: number;
  capitalReturn: number;
  interest: number;
  remainingBalance: number;
}

export interface AmortizationTable {
  leasingId: string;
  totalInstallment: number;
  periods: AmortizationPeriod[];
}
