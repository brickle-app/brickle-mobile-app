import { ethers } from "ethers";
import {
  createContract,
  getWallet,
  provider,
} from "@/src/components/wallet/contracts/config/clients/polygon";
import { handleNetwork } from "@/src/components/wallet/contracts/config/network/networks";
import thresholdFactoryABI from "@/src/components/wallet/contracts/config/abis/threshold-factory.json";
import {
  CampaignStats,
  CreateCampaignParams,
  ThresholdFactoryConfig,
} from "../interfaces";

export class ThresholdFactoryService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor() {
    const networkConfig = handleNetwork();
    this.contractAddress = networkConfig.thresholdFactory.address;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      thresholdFactoryABI,
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
    return createContract(this.contractAddress, thresholdFactoryABI, wallet);
  }

  /**
   * Create a new threshold campaign
   * @param privateKey - Private key for signing the transaction
   * @param params - Campaign creation parameters
   * @returns Campaign address and transaction receipt
   */
  async createCampaign(
    privateKey: string,
    params: CreateCampaignParams
  ): Promise<{
    campaignAddress: string;
    receipt: ethers.ContractTransactionReceipt | null;
  }> {
    try {
      console.log("🏭 Creating new threshold campaign");

      const contractWithSigner = await this.getContractWithSigner(privateKey);

      const tx = await contractWithSigner.createCampaign(
        params.minCap,
        params.maxCap,
        params.deadline,
        params.assetValue,
        params.quantity,
        params.usefulLife,
        params.termMonths,
        params.residualPct,
        params.isOperational,
        params.insurancePct,
        params.riskLevel,
        params.annualRate,
        params.ibrRate,
        params.ibrPeriod,
        params.holdersPct,
        params.bricklePct,
        params.nftAddress,
        params.tokenId,
        params.tokenPrice,
        params.lessee,
        params.brickleWallet
      );

      console.log("✅ Campaign creation transaction sent:", tx.hash);
      const receipt = await tx.wait();

      // Extract campaign address from event logs
      const createEvent = receipt?.logs.find(
        (log: any) =>
          log.topics[0] ===
          ethers.id("CampaignCreated(address,address,uint256,uint256,uint256)")
      );

      let campaignAddress = "";
      if (createEvent) {
        campaignAddress = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address"],
          createEvent.topics[1]
        )[0];
      }

      return { campaignAddress, receipt };
    } catch (error) {
      console.error("❌ Error creating campaign:", error);
      throw new Error(`Failed to create campaign: ${error}`);
    }
  }

  /**
   * Get all campaigns
   * @returns Array of campaign addresses
   */
  async getAllCampaigns(): Promise<string[]> {
    try {
      console.log("📋 Fetching all campaigns");
      const campaigns = await this.contract.getAllCampaigns();
      return campaigns;
    } catch (error) {
      console.error("❌ Error fetching campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error}`);
    }
  }

  /**
   * Get campaign by index
   * @param index - Campaign index
   * @returns Campaign address
   */
  async getCampaign(index: number): Promise<string> {
    try {
      console.log(`🔍 Fetching campaign at index ${index}`);
      const campaign = await this.contract.getCampaign(index);
      return campaign;
    } catch (error) {
      console.error("❌ Error fetching campaign:", error);
      throw new Error(`Failed to fetch campaign: ${error}`);
    }
  }

  /**
   * Get campaigns by owner
   * @param owner - Owner address
   * @returns Array of campaign addresses
   */
  async getCampaignsByOwner(owner: string): Promise<string[]> {
    try {
      console.log(`👤 Fetching campaigns for owner: ${owner}`);
      const campaigns = await this.contract.getCampaignsByOwner(owner);
      return campaigns;
    } catch (error) {
      console.error("❌ Error fetching campaigns by owner:", error);
      throw new Error(`Failed to fetch campaigns by owner: ${error}`);
    }
  }

  /**
   * Get campaigns count by owner
   * @param owner - Owner address
   * @returns Number of campaigns
   */
  async getCampaignsByOwnerCount(owner: string): Promise<number> {
    try {
      console.log(`📊 Fetching campaigns count for owner: ${owner}`);
      const count = await this.contract.getCampaignsByOwnerCount(owner);
      return Number(count);
    } catch (error) {
      console.error("❌ Error fetching campaigns count:", error);
      throw new Error(`Failed to fetch campaigns count: ${error}`);
    }
  }

  /**
   * Get campaign statistics
   * @returns Campaign statistics
   */
  async getCampaignStats(): Promise<CampaignStats> {
    try {
      console.log("📈 Fetching campaign statistics");
      const stats = await this.contract.getCampaignStats();

      return {
        totalCampaigns: stats.totalCampaigns.toString(),
        activeCampaigns: stats.activeCampaigns.toString(),
        successfulCampaigns: stats.successfulCampaigns.toString(),
        failedCampaigns: stats.failedCampaigns.toString(),
        deployedCampaigns: stats.deployedCampaigns.toString(),
      };
    } catch (error) {
      console.error("❌ Error fetching campaign stats:", error);
      throw new Error(`Failed to fetch campaign stats: ${error}`);
    }
  }

  /**
   * Get factory configuration
   * @returns Factory configuration addresses
   */
  async getFactoryConfig(): Promise<ThresholdFactoryConfig> {
    try {
      console.log("⚙️ Fetching factory configuration");

      const [thresholdCampaignImplementation, leasingFactory, usdcAddress] =
        await Promise.all([
          this.contract.thresholdCampaignImplementation(),
          this.contract.leasingFactory(),
          this.contract.usdcAddress(),
        ]);

      return {
        thresholdCampaignImplementation,
        leasingFactory,
        usdcAddress,
      };
    } catch (error) {
      console.error("❌ Error fetching factory config:", error);
      throw new Error(`Failed to fetch factory config: ${error}`);
    }
  }

  /**
   * Get total number of campaigns
   * @returns Total campaigns count
   */
  async getTotalCampaigns(): Promise<number> {
    try {
      console.log("🔢 Fetching total campaigns count");
      const count = await this.contract.totalCampaigns();
      return Number(count);
    } catch (error) {
      console.error("❌ Error fetching total campaigns:", error);
      throw new Error(`Failed to fetch total campaigns: ${error}`);
    }
  }
}
