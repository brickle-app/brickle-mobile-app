// Types based on the ABI
export interface AssetDetails {
  assetValue: bigint;
  quantity: bigint;
  usefulLife: bigint;
  isOperational: boolean;
  riskLevel: number;
}

export interface AssetRefs {
  nftAddress: string;
  tokenId: bigint;
  leasingToken: string;
  usdcAddress: string;
  lessee: string;
  brickleWallet: string;
}

export interface LeaseTerms {
  termMonths: bigint;
  residualPct: bigint;
  insurancePct: bigint;
  annualRate: bigint;
  ibrRate: bigint;
  ibrPeriod: bigint;
}

export interface FinancialDetails {
  totalValue: bigint;
  residualValue: bigint;
  annualInsurance: bigint;
  monthlyRate: bigint;
  monthlyPayment: bigint;
  tokenPrice: bigint;
  totalTokens: bigint;
  tokensSold: bigint;
}

export interface FeeDistribution {
  holdersPct: bigint;
  bricklePct: bigint;
}

export enum LeasingState {
  FUNDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  DEFAULTED = 3,
}
