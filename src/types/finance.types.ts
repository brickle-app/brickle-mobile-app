export interface CreateRechargeDto {
  userId: string;
  amount: number;
  receipt?: string;
  reference: string;
}

export interface RechargeResponseDto {
  id: string;
  userId: string;
  type: string;
  txAmount: number;
  status: string;
  receipt: string;
  hash: string;
  reference: string;
  timestamp: string;
}

export interface CreateWithdrawDto {
  userId: string;
  amount: number;
  reference: string;
}

export type WithdrawResponseDto = RechargeResponseDto;
