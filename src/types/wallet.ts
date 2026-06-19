/**
 * Types for bank and fiat accounts
 */

export interface FiatAccountDetails {
  country: string;
  currency: string;
  network: string;
  expiration: string;
  cardType: string;
  lastFour: string;
  token: string;
  isSingleUse: boolean;
  type: "CARD" | "BANK_ACCOUNT";
}

export interface FiatAccount {
  fiatAccountId: string;
  createdAt: string;
  accountDetails: FiatAccountDetails;
}

export interface UserBankAccounts {
  fiatAccounts: FiatAccount[];
}

// Mock data for testing
export const MOCK_FIAT_ACCOUNTS: UserBankAccounts = {
  fiatAccounts: [
    {
      fiatAccountId: "b547067f-7288-4c64-88a0-2f85aac3e661",
      createdAt: "2025-01-31T08:20:21.420Z",
      accountDetails: {
        country: "CO",
        currency: "COP",
        network: "Mastercard",
        expiration: "2026-02-03T06:06:41.053Z",
        cardType: "CREDIT",
        lastFour: "0085",
        token: "c2a97b65-2b1b-2f6e-8ecf-6a46ecbe54a8",
        isSingleUse: false,
        type: "CARD",
      },
    },
    {
      fiatAccountId: "b547067f-7288-4c64-88a0-2f85aac3e662",
      createdAt: "2025-01-31T08:20:21.420Z",
      accountDetails: {
        country: "CO",
        currency: "COP",
        network: "VISA",
        expiration: "2026-02-03T06:06:41.053Z",
        cardType: "CREDIT",
        lastFour: "0071",
        token: "c2a97b65-2b1b-2f6e-8ecf-6a46ecbe54a2",
        isSingleUse: false,
        type: "CARD",
      },
    },
  ],
};

export const MOCK_BANK_ACCOUNTS_EMPTY: UserBankAccounts = {
  fiatAccounts: [],
};
