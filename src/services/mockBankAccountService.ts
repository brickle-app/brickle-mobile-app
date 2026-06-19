import { UserBankAccounts, MOCK_FIAT_ACCOUNTS } from "../types/wallet";

/**
 * Mock service for bank account operations
 * This simulates API calls to a backend service
 */
class MockBankAccountService {
  private static instance: MockBankAccountService;
  private mockData: UserBankAccounts = MOCK_FIAT_ACCOUNTS;

  private constructor() {}

  public static getInstance(): MockBankAccountService {
    if (!MockBankAccountService.instance) {
      MockBankAccountService.instance = new MockBankAccountService();
    }
    return MockBankAccountService.instance;
  }

  /**
   * Get user's bank accounts
   * @returns Promise<UserBankAccounts>
   */
  public async getUserBankAccounts(): Promise<UserBankAccounts> {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockData);
      }, 1000);
    });
  }

  /**
   * Add a new bank account
   * @param account - The account to add
   */
  public async addBankAccount(account: UserBankAccounts): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.mockData = {
          fiatAccounts: [
            ...this.mockData.fiatAccounts,
            ...account.fiatAccounts,
          ],
        };
        resolve();
      }, 1000);
    });
  }

  /**
   * Remove a bank account
   * @param accountId - The ID of the account to remove
   */
  public async removeBankAccount(accountId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.mockData = {
          fiatAccounts: this.mockData.fiatAccounts.filter(
            (account) => account.fiatAccountId !== accountId
          ),
        };
        resolve();
      }, 1000);
    });
  }
}

export const mockBankAccountService = MockBankAccountService.getInstance();
