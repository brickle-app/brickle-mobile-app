export interface CreateCampaignParams {
  minCap: string;
  maxCap: string;
  deadline: string;
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

export interface CampaignStats {
  totalCampaigns: string;
  activeCampaigns: string;
  successfulCampaigns: string;
  failedCampaigns: string;
  deployedCampaigns: string;
}

export interface ThresholdFactoryConfig {
  thresholdCampaignImplementation: string;
  leasingFactory: string;
  usdcAddress: string;
}
