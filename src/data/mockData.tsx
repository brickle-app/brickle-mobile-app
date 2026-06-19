// Mock data for Discover screen based on Figma design

export interface Agreement {
  userId: string;
  leasingId: string;
  assetValue: number;
  usefulLife: number;
  termTime: number;
  agreementType: string;
  paymentTerm: string;
  currency: string;
  contractDetails: string;
  startDate: string;
  endDate: string;
  installmentRate: number;
  residualValue: number;
  managementFee: number;
  tokensPurchased: number;
  leasingCoreAddress: string;
  insurancePercentage: number;
  ibrRate: number;
  riskLevel: string;
  riskRate: number;
  iva: number;
}

export interface TrendingAsset {
  id: string;
  name: string;
  price: number;
  bidsAvailable: number;
  riskLevel: string;
  roi: string;
  imageUrl: string;
  isNew?: boolean;
  agreement: Agreement;
}
