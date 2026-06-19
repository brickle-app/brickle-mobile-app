export interface UserLeasing {
  id: string;
  assetName: string;
  monthlyPayment: number;
  nextPaymentDate: string;
  paymentStatus: "current" | "pending" | "overdue";
  tokensOwned: number;
  totalTokens: number;
  paymentsCompleted: number;
  totalPayments: number;
  icon: React.ReactNode;
  colorIconBg: string;
  contractStartDate: string;
  contractEndDate: string;
  canClaimRent?: boolean;
}

export type PaymentStatus = "current" | "pending" | "overdue";

export interface PaymentInfo {
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  completedPayments: number;
  totalPayments: number;
}
