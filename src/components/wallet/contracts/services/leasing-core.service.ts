import { ethers } from "ethers";
import { createContract, getWallet, provider } from "../config/clients/polygon";
import { handleNetwork } from "../config/network/networks";
import leasingCoreABI from "../config/abis/leasing-core.json";
import {
  AssetDetails,
  AssetRefs,
  FeeDistribution,
  FinancialDetails,
  LeaseTerms,
  LeasingState,
} from "../interfaces";

export class LeasingCoreService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor() {
    const networkConfig = handleNetwork();
    this.contractAddress = networkConfig.leasingCore.address;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      leasingCoreABI,
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
    return createContract(this.contractAddress, leasingCoreABI, wallet);
  }

  /**
   * Get asset details from the contract
   * @returns AssetDetails object with asset information
   */
  async getAssetDetails(): Promise<AssetDetails> {
    try {
      const result = await this.contract.assetDetails();

      return {
        assetValue: BigInt(result[0].toString()),
        quantity: BigInt(result[1].toString()),
        usefulLife: BigInt(result[2].toString()),
        isOperational: result[3],
        riskLevel: Number(result[4]),
      };
    } catch (error) {
      console.error("❌ Error fetching asset details:", error);
      throw new Error(`Failed to fetch asset details: ${error}`);
    }
  }

  /**
   * Get asset references from the contract
   * @returns AssetRefs object with reference information
   */
  async getAssetRefs(): Promise<AssetRefs> {
    try {
      console.log(
        "🔍 Fetching asset references from contract:",
        this.contractAddress
      );

      const result = await this.contract.assetRefs();

      return {
        nftAddress: result[0],
        tokenId: BigInt(result[1].toString()),
        leasingToken: result[2],
        usdcAddress: result[3],
        lessee: result[4],
        brickleWallet: result[5],
      };
    } catch (error) {
      console.error("❌ Error fetching asset references:", error);
      throw new Error(`Failed to fetch asset references: ${error}`);
    }
  }

  /**
   * Get lease terms from the contract
   * @returns LeaseTerms object with lease information
   */
  async getLeaseTerms(): Promise<LeaseTerms> {
    try {
      console.log(
        "🔍 Fetching lease terms from contract:",
        this.contractAddress
      );

      const result = await this.contract.leaseTerms();

      return {
        termMonths: BigInt(result[0].toString()),
        residualPct: BigInt(result[1].toString()),
        insurancePct: BigInt(result[2].toString()),
        annualRate: BigInt(result[3].toString()),
        ibrRate: BigInt(result[4].toString()),
        ibrPeriod: BigInt(result[5].toString()),
      };
    } catch (error) {
      console.error("❌ Error fetching lease terms:", error);
      throw new Error(`Failed to fetch lease terms: ${error}`);
    }
  }

  /**
   * Get financial details from the contract
   * @returns FinancialDetails object with financial information
   */
  async getFinancialDetails(): Promise<FinancialDetails> {
    try {
      console.log(
        "🔍 Fetching financial details from contract:",
        this.contractAddress
      );

      const result = await this.contract.financialDetails();

      return {
        totalValue: BigInt(result[0].toString()),
        residualValue: BigInt(result[1].toString()),
        annualInsurance: BigInt(result[2].toString()),
        monthlyRate: BigInt(result[3].toString()),
        monthlyPayment: BigInt(result[4].toString()),
        tokenPrice: BigInt(result[5].toString()),
        totalTokens: BigInt(result[6].toString()),
        tokensSold: BigInt(result[7].toString()),
      };
    } catch (error) {
      console.error("❌ Error fetching financial details:", error);
      throw new Error(`Failed to fetch financial details: ${error}`);
    }
  }

  /**
   * Get fee distribution from the contract
   * @returns FeeDistribution object with fee information
   */
  async getFeeDistribution(): Promise<FeeDistribution> {
    try {
      console.log(
        "🔍 Fetching fee distribution from contract:",
        this.contractAddress
      );

      const result = await this.contract.feeDistribution();

      return {
        holdersPct: BigInt(result[0].toString()),
        bricklePct: BigInt(result[1].toString()),
      };
    } catch (error) {
      console.error("❌ Error fetching fee distribution:", error);
      throw new Error(`Failed to fetch fee distribution: ${error}`);
    }
  }

  /**
   * Get contract state
   * @returns Current state of the leasing contract
   */
  async getState(): Promise<LeasingState> {
    try {
      console.log("🔍 Fetching contract state from:", this.contractAddress);

      const result = await this.contract.state();
      return Number(result) as LeasingState;
    } catch (error) {
      console.error("❌ Error fetching contract state:", error);
      throw new Error(`Failed to fetch contract state: ${error}`);
    }
  }

  /**
   * Get contract owner
   * @returns Owner address
   */
  async getOwner(): Promise<string> {
    try {
      console.log("🔍 Fetching contract owner from:", this.contractAddress);

      const result = await this.contract.owner();
      return result;
    } catch (error) {
      console.error("❌ Error fetching contract owner:", error);
      throw new Error(`Failed to fetch contract owner: ${error}`);
    }
  }

  /**
   * Get start time of the lease
   * @returns Start time as timestamp
   */
  async getStartTime(): Promise<bigint> {
    try {
      console.log(
        "🔍 Fetching start time from contract:",
        this.contractAddress
      );

      const result = await this.contract.startTime();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching start time:", error);
      throw new Error(`Failed to fetch start time: ${error}`);
    }
  }

  /**
   * Get cumulative dividend per token
   * @returns Cumulative dividend per token
   */
  async getCumulativeDividendPerToken(): Promise<bigint> {
    try {
      console.log(
        "🔍 Fetching cumulative dividend per token from contract:",
        this.contractAddress
      );

      const result = await this.contract.cumulativeDividendPerToken();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching cumulative dividend per token:", error);
      throw new Error(
        `Failed to fetch cumulative dividend per token: ${error}`
      );
    }
  }

  /**
   * Get last claimed timestamp for an address
   * @param address - The address to check
   * @returns Last claimed timestamp
   */
  async getLastClaimed(address: string): Promise<bigint> {
    try {
      console.log("🔍 Fetching last claimed for address:", address);

      const result = await this.contract.lastClaimed(address);
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching last claimed:", error);
      throw new Error(`Failed to fetch last claimed: ${error}`);
    }
  }

  // Write functions (require private key for signing)

  /**
   * Buy tokens from the contract
   * @param amount - Amount of tokens to buy (in wei)
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async buyTokens(
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("💰 Buying tokens:", amount.toString());

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.buyTokens(amount);

      console.log("✅ Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error buying tokens:", error);
      throw new Error(`Failed to buy tokens: ${error}`);
    }
  }

  /**
   * Claim dividends
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async claimDividends(
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("💰 Claiming dividends");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.claimDividends();

      console.log("✅ Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error claiming dividends:", error);
      throw new Error(`Failed to claim dividends: ${error}`);
    }
  }

  /**
   * Exercise option (buy the asset)
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async exerciseOption(
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🏠 Exercising option");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.exerciseOption();

      console.log("✅ Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error exercising option:", error);
      throw new Error(`Failed to exercise option: ${error}`);
    }
  }

  /**
   * Receive payment to the contract
   * @param amount - Payment amount
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async receivePayment(
    amount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`💰 Receiving payment of ${amount.toString()}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.receivePayment(amount);

      console.log("✅ Payment transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error receiving payment:", error);
      throw new Error(`Failed to receive payment: ${error}`);
    }
  }

  // ============ NEW THRESHOLD-RELATED FUNCTIONS ============

  /**
   * Check if this contract is from a threshold campaign
   * @returns True if contract originated from threshold campaign
   */
  async isFromThreshold(): Promise<boolean> {
    try {
      console.log("🔍 Checking if contract is from threshold");
      const result = await this.contract.isFromThreshold();
      return result;
    } catch (error) {
      console.error("❌ Error checking threshold origin:", error);
      throw new Error(`Failed to check threshold origin: ${error}`);
    }
  }

  /**
   * Get threshold campaign address
   * @returns Threshold campaign contract address
   */
  async getThresholdCampaign(): Promise<string> {
    try {
      console.log("🔍 Fetching threshold campaign address");
      const result = await this.contract.thresholdCampaign();
      return result;
    } catch (error) {
      console.error("❌ Error fetching threshold campaign:", error);
      throw new Error(`Failed to fetch threshold campaign: ${error}`);
    }
  }

  /**
   * Authorize/deauthorize a threshold campaign
   * @param campaign - Campaign address to authorize
   * @param authorized - Whether to authorize or deauthorize
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async authorizeThresholdCampaign(
    campaign: string,
    authorized: boolean,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `🔐 ${
          authorized ? "Authorizing" : "Deauthorizing"
        } threshold campaign: ${campaign}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.authorizeThresholdCampaign(
        campaign,
        authorized
      );

      console.log("✅ Authorization transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error authorizing threshold campaign:", error);
      throw new Error(`Failed to authorize threshold campaign: ${error}`);
    }
  }

  /**
   * Check if a threshold campaign is authorized
   * @param campaign - Campaign address to check
   * @returns True if campaign is authorized
   */
  async isThresholdCampaignAuthorized(campaign: string): Promise<boolean> {
    try {
      console.log(
        `🔍 Checking if threshold campaign is authorized: ${campaign}`
      );
      const result = await this.contract.authorizedThresholdCampaigns(campaign);
      return result;
    } catch (error) {
      console.error("❌ Error checking campaign authorization:", error);
      throw new Error(`Failed to check campaign authorization: ${error}`);
    }
  }

  /**
   * Check threshold interface compatibility
   * @param caller - Address to check
   * @returns True if caller supports threshold interface
   */
  async checkThresholdInterface(caller: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking threshold interface for: ${caller}`);
      const result = await this.contract._checkThresholdInterface(caller);
      return result;
    } catch (error) {
      console.error("❌ Error checking threshold interface:", error);
      throw new Error(`Failed to check threshold interface: ${error}`);
    }
  }

  // ============ BALANCE MANAGEMENT FUNCTIONS ============

  /**
   * Get tracked token balance
   * @returns Tracked token balance
   */
  async getTrackedTokenBalance(): Promise<bigint> {
    try {
      console.log("📊 Fetching tracked token balance");
      const result = await this.contract.trackedTokenBalance();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching tracked token balance:", error);
      throw new Error(`Failed to fetch tracked token balance: ${error}`);
    }
  }

  /**
   * Get tracked COP$ balance
   * @returns Tracked COP$ balance
   */
  async getTrackedUsdcBalance(): Promise<bigint> {
    try {
      console.log("📊 Fetching tracked COP$ balance");
      const result = await this.contract.trackedUsdcBalance();
      return BigInt(result.toString());
    } catch (error) {
      console.error("❌ Error fetching tracked COP$ balance:", error);
      throw new Error(`Failed to fetch tracked COP$ balance: ${error}`);
    }
  }

  /**
   * Get balance discrepancy for a token
   * @param tokenAddress - Token address to check
   * @returns Balance discrepancy information
   */
  async getBalanceDiscrepancy(tokenAddress: string): Promise<{
    actualBalance: bigint;
    trackedBalance: bigint;
    excessAmount: bigint;
  }> {
    try {
      console.log(`📊 Checking balance discrepancy for token: ${tokenAddress}`);
      const result = await this.contract.getBalanceDiscrepancy(tokenAddress);

      return {
        actualBalance: BigInt(result.actualBalance.toString()),
        trackedBalance: BigInt(result.trackedBalance.toString()),
        excessAmount: BigInt(result.excessAmount.toString()),
      };
    } catch (error) {
      console.error("❌ Error checking balance discrepancy:", error);
      throw new Error(`Failed to check balance discrepancy: ${error}`);
    }
  }

  /**
   * Initialize tracked balances
   * @param tokenAmount - Initial token amount to track
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async initializeTrackedBalances(
    tokenAmount: bigint,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `⚡ Initializing tracked balances with token amount: ${tokenAmount.toString()}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.initializeTrackedBalances(
        tokenAmount
      );

      console.log("✅ Initialize balances transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error initializing tracked balances:", error);
      throw new Error(`Failed to initialize tracked balances: ${error}`);
    }
  }

  /**
   * Recover excess tokens
   * @param tokenAddress - Token address to recover
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async recoverExcessTokens(
    tokenAddress: string,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`🔄 Recovering excess tokens for: ${tokenAddress}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.recoverExcessTokens(tokenAddress);

      console.log("✅ Recovery transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error recovering excess tokens:", error);
      throw new Error(`Failed to recover excess tokens: ${error}`);
    }
  }

  // ============ INITIALIZATION MANAGEMENT FUNCTIONS ============

  /**
   * Get initialization status
   * @returns Initialization status information
   */
  async getInitializationStatus(): Promise<{
    initialized: boolean;
    sentinel: boolean;
    completed: boolean;
  }> {
    try {
      console.log("🔍 Fetching initialization status");
      const result = await this.contract.getInitializationStatus();

      return {
        initialized: result.initialized,
        sentinel: result.sentinel,
        completed: result.completed,
      };
    } catch (error) {
      console.error("❌ Error fetching initialization status:", error);
      throw new Error(`Failed to fetch initialization status: ${error}`);
    }
  }

  /**
   * Recover from failed initialization
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async recoverFromFailedInitialization(
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🔄 Recovering from failed initialization");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.recoverFromFailedInitialization();

      console.log("✅ Recovery transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error recovering from failed initialization:", error);
      throw new Error(`Failed to recover from failed initialization: ${error}`);
    }
  }

  // ============ FACTORY MANAGEMENT FUNCTIONS ============

  /**
   * Get factory address
   * @returns Factory contract address
   */
  async getFactoryAddress(): Promise<string> {
    try {
      console.log("🔍 Fetching factory address");
      const result = await this.contract.factoryAddress();
      return result;
    } catch (error) {
      console.error("❌ Error fetching factory address:", error);
      throw new Error(`Failed to fetch factory address: ${error}`);
    }
  }

  /**
   * Set factory address
   * @param factoryAddress - New factory address
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async setFactoryAddress(
    factoryAddress: string,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`⚙️ Setting factory address to: ${factoryAddress}`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.setFactoryAddress(factoryAddress);

      console.log("✅ Set factory transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error setting factory address:", error);
      throw new Error(`Failed to set factory address: ${error}`);
    }
  }

  // ============ TOKEN DISTRIBUTION FUNCTIONS ============

  /**
   * Distribute tokens to contributors
   * @param recipients - Array of recipient addresses
   * @param amounts - Array of token amounts
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async distributeTokensToContributors(
    recipients: string[],
    amounts: bigint[],
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `📤 Distributing tokens to ${recipients.length} contributors`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.distributeTokensToContributors(
        recipients,
        amounts
      );

      console.log("✅ Distribution transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error distributing tokens:", error);
      throw new Error(`Failed to distribute tokens: ${error}`);
    }
  }
}
