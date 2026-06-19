export interface LoginResponse {
  access_token: string;
  user: User;
  tokenExpiration: number;
}

export interface User {
  id: string;
  email: string;
}
export interface CreateWalletResponse {
  id: string;
  name: string;
  blockchainType: string;
  networkType: string;
  address: string;
  publicKey: string;
  isDefault: boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetPrivateKeyResponse {
  privateKey: string;
}
