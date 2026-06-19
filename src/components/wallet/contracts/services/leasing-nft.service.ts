import { ethers } from "ethers";
import { createContract, getWallet, provider } from "../config/clients/polygon";
import leasingNftABI from "../config/abis/leasing-nft.json";

export interface NftTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export class LeasingNftService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(nftAddress: string) {
    this.contractAddress = nftAddress;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      leasingNftABI,
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
    return createContract(this.contractAddress, leasingNftABI, wallet);
  }

  // ============ READ FUNCTIONS ============

  /**
   * Get NFT token information
   * @returns NFT token basic information
   */
  async getTokenInfo(): Promise<NftTokenInfo> {
    try {
      console.log("📋 Fetching NFT token information");

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
      console.error("❌ Error fetching NFT token info:", error);
      throw new Error(`Failed to fetch NFT token info: ${error}`);
    }
  }

  /**
   * Get NFT token name
   * @returns NFT token name
   */
  async getName(): Promise<string> {
    try {
      console.log("📋 Fetching NFT token name");
      const result = await this.contract.name();
      return result;
    } catch (error) {
      console.error("❌ Error fetching NFT token name:", error);
      throw new Error(`Failed to fetch NFT token name: ${error}`);
    }
  }

  /**
   * Get NFT token symbol
   * @returns NFT token symbol
   */
  async getSymbol(): Promise<string> {
    try {
      console.log("📋 Fetching NFT token symbol");
      const result = await this.contract.symbol();
      return result;
    } catch (error) {
      console.error("❌ Error fetching NFT token symbol:", error);
      throw new Error(`Failed to fetch NFT token symbol: ${error}`);
    }
  }

  /**
   * Get NFT token decimals
   * @returns Number of decimals
   */
  async getDecimals(): Promise<number> {
    try {
      console.log("📋 Fetching NFT token decimals");
      const result = await this.contract.decimals();
      return Number(result);
    } catch (error) {
      console.error("❌ Error fetching NFT token decimals:", error);
      throw new Error(`Failed to fetch NFT token decimals: ${error}`);
    }
  }

  /**
   * Get total supply
   * @returns Total NFT token supply
   */
  async getTotalSupply(): Promise<bigint> {
    try {
      console.log("📊 Fetching NFT total supply");
      const result = await this.contract.totalSupply();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching NFT total supply:", error);
      throw new Error(`Failed to fetch NFT total supply: ${error}`);
    }
  }

  /**
   * Get balance of an address
   * @param address - Address to check balance for
   * @returns NFT token balance
   */
  async getBalanceOf(address: string): Promise<bigint> {
    try {
      console.log(`👤 Fetching NFT balance for: ${address}`);
      const result = await this.contract.balanceOf(address);
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching NFT balance:", error);
      throw new Error(`Failed to fetch NFT balance: ${error}`);
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
      console.log(
        `🔍 Fetching NFT allowance: owner=${owner}, spender=${spender}`
      );
      const result = await this.contract.allowance(owner, spender);
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching NFT allowance:", error);
      throw new Error(`Failed to fetch NFT allowance: ${error}`);
    }
  }

  // ============ WRITE FUNCTIONS ============

  /**
   * Initialize the NFT token contract
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
        `⚡ Initializing NFT token with supply: ${totalSupply.toString()}, core: ${leasingCore}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.initialize(totalSupply, leasingCore);

      console.log("✅ NFT Initialize transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error initializing NFT token:", error);
      throw new Error(`Failed to initialize NFT token: ${error}`);
    }
  }

  /**
   * Transfer NFT tokens
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
      console.log(`💸 Transferring ${amount.toString()} NFT tokens to: ${to}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.transfer(to, amount);

      console.log("✅ NFT Transfer transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error transferring NFT tokens:", error);
      throw new Error(`Failed to transfer NFT tokens: ${error}`);
    }
  }

  /**
   * Transfer NFT tokens from one address to another
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
        `💸 Transferring ${amount.toString()} NFT tokens from ${from} to ${to}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.transferFrom(from, to, amount);

      console.log("✅ NFT TransferFrom transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error transferring NFT tokens from:", error);
      throw new Error(`Failed to transfer NFT tokens from: ${error}`);
    }
  }

  /**
   * Approve spender to use NFT tokens
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
        `✅ Approving ${amount.toString()} NFT tokens for spender: ${spender}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.approve(spender, amount);

      console.log("✅ NFT Approval transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error approving NFT tokens:", error);
      throw new Error(`Failed to approve NFT tokens: ${error}`);
    }
  }

  /**
   * Burn NFT tokens
   * @param amount - Amount to burn
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async burn(
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`🔥 Burning ${amount.toString()} NFT tokens`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.burn(amount);

      console.log("✅ NFT Burn transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error burning NFT tokens:", error);
      throw new Error(`Failed to burn NFT tokens: ${error}`);
    }
  }

  /**
   * Burn NFT tokens from another account
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
      console.log(
        `🔥 Burning ${amount.toString()} NFT tokens from: ${account}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.burnFrom(account, amount);

      console.log("✅ NFT BurnFrom transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error burning NFT tokens from account:", error);
      throw new Error(`Failed to burn NFT tokens from account: ${error}`);
    }
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Format NFT token amount with decimals
   * @param amount - Raw amount in wei
   * @returns Formatted amount as string
   */
  async formatTokenAmount(amount: bigint): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      console.error("❌ Error formatting NFT token amount:", error);
      throw new Error(`Failed to format NFT token amount: ${error}`);
    }
  }

  /**
   * Parse NFT token amount from string to wei
   * @param amount - Amount as string
   * @returns Amount in wei as bigint
   */
  async parseTokenAmount(amount: string): Promise<bigint> {
    try {
      const decimals = await this.getDecimals();
      return ethers.parseUnits(amount, decimals);
    } catch (error) {
      console.error("❌ Error parsing NFT token amount:", error);
      throw new Error(`Failed to parse NFT token amount: ${error}`);
    }
  }
}
