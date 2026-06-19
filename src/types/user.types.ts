export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

// export interface BrickleUser {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   kycCustomerId: string;
//   createdAt: string;
//   updatedAt: string;
// }

export interface BrickleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  walletAddress: string;
  phoneNumber: string;
  termsAccepted: boolean;
  dateOfBirth: Date;
  nationality: string;
  countryOfResidence: string;
  documentType: DocumentTypeEnum;
  documentNumber: string;
  kycCustomerId: string;
  createdAt: Date;
  isBasicProfileComplete: boolean;
  isFullProfileComplete: boolean;
  isProfileUnderReview?: boolean;
  fullName: string;
  pushNotificationToken: string;
  externalWalletId: string | null;
  currentSession: string | null;
}

export enum DocumentTypeEnum {
  CC = 1,
  CE = 2,
  Pasaporte = 3,
}

export interface BrickleUserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
  walletAddress: string;
}

export type CreateBrickleUserRequest = Partial<BrickleUser>;

export interface CreateBrickleUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  walletAddress: string;
  phoneNumber: string;
  termsAccepted: boolean;
  dateOfBirth: Date | undefined;
  nationality: string;
  countryOfResidence: string;
  documentType: DocumentTypeEnum;
  documentNumber: string;
  kycCustomerId: string;
  createdAt: Date;
  isBasicProfileComplete: boolean;
  isFullProfileComplete: boolean;
  isProfileUnderReview?: boolean;
  fullName: string;
  pushNotificationToken: string;
  externalWalletId: string | null;
  currentSessionId: string | null;
}

export type PartialBrickleUser = Partial<BrickleUser>;

// Type for API updates where dateOfBirth can be a string (yyyy/mm/dd format)
export type BrickleUserUpdateRequest = Partial<
  Omit<BrickleUser, "dateOfBirth">
> & {
  dateOfBirth?: Date | string;
};

export type LOG_TYPE =
  | "INVESTMENT"
  | "INVESTMENT-RETURN"
  | "INVESTMENT-RETURN-INTEREST"
  | "INVESTMENT-RETURN-CAPITAL"
  | "RECHARGE"
  | "WITHDRAW";
export type STATUS = "SUCCESS" | "PENDING" | "FAILED";
export interface STATUS_TYPE {
  [key: string]: STATUS;
}

export interface UserActivityLog {
  userId: string;
  type: LOG_TYPE;
  txAmount: number;
  status: STATUS;
  reference: string;
  receipt?: string;
  hash?: string;
  timestamp: string;
}

export interface UserActivityLogResponse {
  userId: string;
  daysBack: number;
  totalLogs: number;
  logs: UserActivityLog[];
}
