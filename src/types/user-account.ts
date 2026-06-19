export interface UserAccountResponse {
  id: string;
  userId: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  accountDocument: string;
  accountImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserAccounts {
  id: string;
  bankName: string;
  accountType: string;
  maskedAccountNumber: string;
  accountHolder: string;
  createdAt: string;
}

export type UserAccount = Omit<
  UserAccountResponse,
  "id" | "createdAt" | "updatedAt"
>;
