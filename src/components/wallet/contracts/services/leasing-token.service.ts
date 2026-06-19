import { ethers } from "ethers";
import { createContract, getWallet, provider } from "../config/clients/polygon";
import leasingTokenABI from "../config/abis/leasing-token.json";

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export class LeasingTokenService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(tokenAddress: string) {
    this.contractAddress = tokenAddress;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      leasingTokenABI,
      provider
    );
  }

  /**
   * Get contract instance with wallet for write operations
   * @param privateKey - The private key for signing transactions
   * @returns Contract instance with signer
   */
  private async getContractWithSigner(
    privateKey: string
  ): Promise<ethers.Contract> {
    const wallet = await getWallet(privateKey);
    return createContract(this.contractAddress, leasingTokenABI, wallet);
  }

  // ============ READ FUNCTIONS ============

  /**
   * Get token information
   * @returns Token basic information
   */
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      console.log("📋 Fetching token information");

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: BigInt(totalSupply.toString()),
      };
    } catch (error) {
      console.error("❌ Error fetching token info:", error);
      throw new Error(`Failed to fetch token info: ${error}`);
    }
  }

  /**
   * Get token name
   * @returns Token name
   */
  async getName(): Promise<string> {
    try {
      console.log("📋 Fetching token name");
      const result = await this.contract.name();
      return result;
    } catch (error) {
      console.error("❌ Error fetching token name:", error);
      throw new Error(`Failed to fetch token name: ${error}`);
    }
  }

  /**
   * Get token symbol
   * @returns Token symbol
   */
  async getSymbol(): Promise<string> {
    try {
      console.log("📋 Fetching token symbol");
      const result = await this.contract.symbol();
      return result;
    } catch (error) {
      console.error("❌ Error fetching token symbol:", error);
      throw new Error(`Failed to fetch token symbol: ${error}`);
    }
  }

  /**
   * Get token decimals
   * @returns Number of decimals
   */
  async getDecimals(): Promise<number> {
    try {
      console.log("📋 Fetching token decimals");
      const result = await this.contract.decimals();
      return Number(result);
    } catch (error) {
      console.error("❌ Error fetching token decimals:", error);
      throw new Error(`Failed to fetch token decimals: ${error}`);
    }
  }

  /**
   * Get total supply
   * @returns Total token supply
   */
  async getTotalSupply(): Promise<bigint> {
    try {
      console.log("📊 Fetching total supply");
      const result = await this.contract.totalSupply();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching total supply:", error);
      throw new Error(`Failed to fetch total supply: ${error}`);
    }
  }

  /**
   * Get balance of an address
   * @param address - Address to check balance for
   * @returns Token balance
   */
  async getBalanceOf(address: string): Promise<bigint> {
    try {
      console.log(`👤 Fetching balance for: ${address}`);
      const result = await this.contract.balanceOf(address);
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      throw new Error(`Failed to fetch balance: ${error}`);
    }
  }

  /**
   * Get allowance between owner and spender
   * @param owner - Token owner address
   * @param spender - Spender address
   * @returns Allowance amount
   */
  async getAllowance(owner: string, spender: string): Promise<bigint> {
    try {
      console.log(`🔍 Fetching allowance: owner=${owner}, spender=${spender}`);
      const result = await this.contract.allowance(owner, spender);
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching allowance:", error);
      throw new Error(`Failed to fetch allowance: ${error}`);
    }
  }

  // ============ WRITE FUNCTIONS ============

  /**
   * Initialize the token contract
   * @param totalSupply - Total supply to mint
   * @param leasingCore - Leasing core address
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async initialize(
    totalSupply: bigint,
    leasingCore: string,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `⚡ Initializing token with supply: ${totalSupply.toString()}, core: ${leasingCore}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.initialize(totalSupply, leasingCore);

      console.log("✅ Initialize transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error initializing token:", error);
      throw new Error(`Failed to initialize token: ${error}`);
    }
  }

  /**
   * Transfer tokens
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async transfer(
    to: string,
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`💸 Transferring ${amount.toString()} tokens to: ${to}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.transfer(to, amount);

      console.log("✅ Transfer transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error transferring tokens:", error);
      throw new Error(`Failed to transfer tokens: ${error}`);
    }
  }

  /**
   * Transfer tokens from one address to another
   * @param from - Sender address
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async transferFrom(
    from: string,
    to: string,
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `💸 Transferring ${amount.toString()} tokens from ${from} to ${to}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.transferFrom(from, to, amount);

      console.log("✅ TransferFrom transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error transferring tokens from:", error);
      throw new Error(`Failed to transfer tokens from: ${error}`);
    }
  }

  /**
   * Approve spender to use tokens
   * @param spender - Spender address
   * @param amount - Amount to approve
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async approve(
    spender: string,
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `✅ Approving ${amount.toString()} tokens for spender: ${spender}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.approve(spender, amount);

      console.log("✅ Approval transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error approving tokens:", error);
      throw new Error(`Failed to approve tokens: ${error}`);
    }
  }

  /**
   * Burn tokens
   * @param amount - Amount to burn
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async burn(
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`🔥 Burning ${amount.toString()} tokens`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.burn(amount);

      console.log("✅ Burn transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error burning tokens:", error);
      throw new Error(`Failed to burn tokens: ${error}`);
    }
  }

  /**
   * Burn tokens from another account
   * @param account - Account to burn from
   * @param amount - Amount to burn
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async burnFrom(
    account: string,
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`🔥 Burning ${amount.toString()} tokens from: ${account}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.burnFrom(account, amount);

      console.log("✅ BurnFrom transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error burning tokens from account:", error);
      throw new Error(`Failed to burn tokens from account: ${error}`);
    }
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Format token amount with decimals
   * @param amount - Raw amount in wei
   * @returns Formatted amount as string
   */
  async formatTokenAmount(amount: bigint): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      console.error("❌ Error formatting token amount:", error);
      throw new Error(`Failed to format token amount: ${error}`);
    }
  }

  /**
   * Parse token amount from string to wei
   * @param amount - Amount as string
   * @returns Amount in wei as bigint
   */
  async parseTokenAmount(amount: string): Promise<bigint> {
    try {
      const decimals = await this.getDecimals();
      return ethers.parseUnits(amount, decimals);
    } catch (error) {
      console.error("❌ Error parsing token amount:", error);
      throw new Error(`Failed to parse token amount: ${error}`);
    }
  }
}
