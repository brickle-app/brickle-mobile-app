// Types based on the leasing-factory ABI

export interface LeasingFactoryConfig {
  baseLeasingCore: string;
  baseLeasingToken: string;
  usdcAddress: string;
}

export interface CreateLeasingParams {
  assetValue: bigint;
  quantity: bigint;
  usefulLife: bigint;
  termMonths: bigint;
  residualPct: bigint;
  isOperational: boolean;
  insurancePct: bigint;
  riskLevel: number;
  annualRate: bigint;
  ibrRate: bigint;
  ibrPeriod: bigint;
  holdersPct: bigint;
  bricklePct: bigint;
  nftAddress: string;
  tokenId: bigint;
  tokenPrice: bigint;
  lessee: string;
  brickleWallet: string;
}

export interface LeasingCreatedEvent {
  leasingCore: string;
  leasingToken: string;
}
