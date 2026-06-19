export interface CampaignDetails {
  owner: string;
  minCap: string;
  maxCap: string;
  deadline: string;
  totalRaised: string;
  isSuccessful: boolean;
  isDeployed: boolean;
  deployedLeasingCore: string;
  deployedLeasingToken: string;
}

export interface LeasingParams {
  assetValue: string;
  quantity: string;
  usefulLife: string;
  termMonths: string;
  residualPct: string;
  isOperational: boolean;
  insurancePct: string;
  riskLevel: number;
  annualRate: string;
  ibrRate: string;
  ibrPeriod: string;
  holdersPct: string;
  bricklePct: string;
  nftAddress: string;
  tokenId: string;
  tokenPrice: string;
  lessee: string;
  brickleWallet: string;
}

export interface ContributorInfo {
  address: string;
  amount: string;
  hasCommitted: boolean;
  commitmentHash: string;
  commitTimestamp: string;
}

export interface CampaignStatus {
  isActive: boolean;
  isSuccessful: boolean;
  isFailed: boolean;
  isDeployed: boolean;
  progress: number;
  timeRemaining: string;
}
