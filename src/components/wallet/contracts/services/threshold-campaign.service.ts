import { ethers } from "ethers";
import {
  createContract,
  getWallet,
  provider,
} from "@/src/components/wallet/contracts/config/clients/polygon";
import thresholdCampaignABI from "@/src/components/wallet/contracts/config/abis/threshold-campaing.json";
import { CampaignDetails, CampaignStatus, LeasingParams } from "../interfaces";

export class ThresholdCampaignService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(campaignAddress: string) {
    this.contractAddress = campaignAddress;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      thresholdCampaignABI,
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
    return createContract(this.contractAddress, thresholdCampaignABI, wallet);
  }

  /**
   * Commit funds to the campaign
   * @param privateKey - Private key for signing the transaction
   * @param amount - Amount to contribute in COP$ (wei format)
   * @returns Transaction receipt
   */
  async commitFunds(
    privateKey: string,
    amount: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`💰 Committing ${amount} COP$ to campaign`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.commitFunds(amount);

      console.log("✅ Funds commitment transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error committing funds:", error);
      throw new Error(`Failed to commit funds: ${error}`);
    }
  }

  /**
   * Commit with commit-reveal scheme
   * @param privateKey - Private key for signing the transaction
   * @param commitmentHash - Hash of amount + nonce
   * @returns Transaction receipt
   */
  async commitContribution(
    privateKey: string,
    commitmentHash: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🔒 Committing contribution with hash");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.commitContribution(commitmentHash);

      console.log("✅ Commitment transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error committing contribution:", error);
      throw new Error(`Failed to commit contribution: ${error}`);
    }
  }

  /**
   * Reveal contribution in commit-reveal scheme
   * @param privateKey - Private key for signing the transaction
   * @param amount - Actual contribution amount
   * @param nonce - Nonce used in commitment
   * @returns Transaction receipt
   */
  async revealContribution(
    privateKey: string,
    amount: string,
    nonce: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🔓 Revealing contribution");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.revealContribution(amount, nonce);

      console.log("✅ Reveal transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error revealing contribution:", error);
      throw new Error(`Failed to reveal contribution: ${error}`);
    }
  }

  /**
   * Claim refund if campaign failed
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async claimRefund(
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("💸 Claiming refund");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.claimRefund();

      console.log("✅ Refund claim transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error claiming refund:", error);
      throw new Error(`Failed to claim refund: ${error}`);
    }
  }

  /**
   * Deploy leasing contracts (only if campaign successful)
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async deployLeasingContracts(
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🚀 Deploying leasing contracts");

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.deployLeasingContracts();

      console.log("✅ Deployment transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error deploying contracts:", error);
      throw new Error(`Failed to deploy contracts: ${error}`);
    }
  }

  /**
   * Distribute tokens to contributors in batches
   * @param privateKey - Private key for signing the transaction
   * @param batchSize - Number of contributors to process
   * @returns Transaction receipt
   */
  async distributeTokensBatch(
    privateKey: string,
    batchSize: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(`📤 Distributing tokens to ${batchSize} contributors`);

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.distributeTokensBatch(batchSize);

      console.log("✅ Token distribution transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error distributing tokens:", error);
      throw new Error(`Failed to distribute tokens: ${error}`);
    }
  }

  /**
   * Get campaign details
   * @returns Campaign details
   */
  async getCampaignDetails(): Promise<CampaignDetails> {
    try {
      console.log("📋 Fetching campaign details");

      const [
        owner,
        minCap,
        maxCap,
        deadline,
        totalRaised,
        isSuccessful,
        deployedLeasingCore,
        deployedLeasingToken,
      ] = await Promise.all([
        this.contract.owner(),
        this.contract.minCap(),
        this.contract.maxCap(),
        this.contract.deadline(),
        this.contract.totalRaised(),
        this.contract.isSuccessful(),
        this.contract.deployedLeasingCore(),
        this.contract.deployedLeasingToken(),
      ]);

      const isDeployed = deployedLeasingCore !== ethers.ZeroAddress;

      return {
        owner,
        minCap: minCap.toString(),
        maxCap: maxCap.toString(),
        deadline: deadline.toString(),
        totalRaised: totalRaised.toString(),
        isSuccessful,
        isDeployed,
        deployedLeasingCore,
        deployedLeasingToken,
      };
    } catch (error) {
      console.error("❌ Error fetching campaign details:", error);
      throw new Error(`Failed to fetch campaign details: ${error}`);
    }
  }

  /**
   * Get leasing parameters
   * @returns Leasing parameters
   */
  async getLeasingParams(): Promise<LeasingParams> {
    try {
      console.log("⚙️ Fetching leasing parameters");

      const params = await this.contract.leasingParams();

      return {
        assetValue: params.assetValue.toString(),
        quantity: params.quantity.toString(),
        usefulLife: params.usefulLife.toString(),
        termMonths: params.termMonths.toString(),
        residualPct: params.residualPct.toString(),
        isOperational: params.isOperational,
        insurancePct: params.insurancePct.toString(),
        riskLevel: params.riskLevel,
        annualRate: params.annualRate.toString(),
        ibrRate: params.ibrRate.toString(),
        ibrPeriod: params.ibrPeriod.toString(),
        holdersPct: params.holdersPct.toString(),
        bricklePct: params.bricklePct.toString(),
        nftAddress: params.nftAddress,
        tokenId: params.tokenId.toString(),
        tokenPrice: params.tokenPrice.toString(),
        lessee: params.lessee,
        brickleWallet: params.brickleWallet,
      };
    } catch (error) {
      console.error("❌ Error fetching leasing params:", error);
      throw new Error(`Failed to fetch leasing params: ${error}`);
    }
  }

  /**
   * Get campaign progress percentage
   * @returns Progress percentage (0-100)
   */
  async getProgress(): Promise<number> {
    try {
      console.log("📊 Fetching campaign progress");
      const progress = await this.contract.getProgress();
      return Number(progress);
    } catch (error) {
      console.error("❌ Error fetching progress:", error);
      throw new Error(`Failed to fetch progress: ${error}`);
    }
  }

  /**
   * Get time remaining in seconds
   * @returns Time remaining in seconds
   */
  async getTimeRemaining(): Promise<number> {
    try {
      console.log("⏰ Fetching time remaining");
      const timeRemaining = await this.contract.getTimeRemaining();
      return Number(timeRemaining);
    } catch (error) {
      console.error("❌ Error fetching time remaining:", error);
      throw new Error(`Failed to fetch time remaining: ${error}`);
    }
  }

  /**
   * Get contribution amount for a specific address
   * @param contributorAddress - Address of the contributor
   * @returns Contribution amount
   */
  async getContribution(contributorAddress: string): Promise<string> {
    try {
      console.log(`👤 Fetching contribution for ${contributorAddress}`);
      const contribution = await this.contract.contributions(
        contributorAddress
      );
      return contribution.toString();
    } catch (error) {
      console.error("❌ Error fetching contribution:", error);
      throw new Error(`Failed to fetch contribution: ${error}`);
    }
  }

  /**
   * Get contributor by index
   * @param index - Contributor index
   * @returns Contributor address
   */
  async getContributor(index: number): Promise<string> {
    try {
      console.log(`🔍 Fetching contributor at index ${index}`);
      const contributor = await this.contract.contributors(index);
      return contributor;
    } catch (error) {
      console.error("❌ Error fetching contributor:", error);
      throw new Error(`Failed to fetch contributor: ${error}`);
    }
  }

  /**
   * Get total number of contributors
   * @returns Number of contributors
   */
  async getContributorsCount(): Promise<number> {
    try {
      console.log("🔢 Fetching contributors count");
      const count = await this.contract.getContributorsCount();
      return Number(count);
    } catch (error) {
      console.error("❌ Error fetching contributors count:", error);
      throw new Error(`Failed to fetch contributors count: ${error}`);
    }
  }

  /**
   * Check if campaign is successful
   * @returns True if campaign reached minimum cap
   */
  async isSuccessful(): Promise<boolean> {
    try {
      console.log("✅ Checking if campaign is successful");
      const successful = await this.contract.isSuccessful();
      return successful;
    } catch (error) {
      console.error("❌ Error checking success status:", error);
      throw new Error(`Failed to check success status: ${error}`);
    }
  }

  /**
   * Check if campaign has expired
   * @returns True if current time > deadline
   */
  async hasExpired(): Promise<boolean> {
    try {
      console.log("⏰ Checking if campaign has expired");
      const deadline = await this.contract.deadline();
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime > Number(deadline);
    } catch (error) {
      console.error("❌ Error checking expiration:", error);
      throw new Error(`Failed to check expiration: ${error}`);
    }
  }

  /**
   * Get comprehensive campaign status
   * @returns Campaign status object
   */
  async getCampaignStatus(): Promise<CampaignStatus> {
    try {
      console.log("📊 Fetching campaign status");

      const [
        progress,
        timeRemaining,
        isSuccessful,
        hasExpired,
        deployedLeasingCore,
      ] = await Promise.all([
        this.getProgress(),
        this.getTimeRemaining(),
        this.isSuccessful(),
        this.hasExpired(),
        this.contract.deployedLeasingCore(),
      ]);

      const isDeployed = deployedLeasingCore !== ethers.ZeroAddress;

      return {
        isActive: !hasExpired && !isSuccessful,
        isSuccessful,
        isFailed: hasExpired && !isSuccessful,
        isDeployed,
        progress,
        timeRemaining: timeRemaining.toString(),
      };
    } catch (error) {
      console.error("❌ Error fetching campaign status:", error);
      throw new Error(`Failed to fetch campaign status: ${error}`);
    }
  }
}
