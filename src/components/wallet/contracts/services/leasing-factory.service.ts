import { ethers } from "ethers";
import { createContract, getWallet, provider } from "../config/clients/polygon";
import { handleNetwork } from "../config/network/networks";
import leasingFactoryABI from "../config/abis/leasing-factory.json";
import {
  LeasingFactoryConfig,
  CreateLeasingParams,
  LeasingCreatedEvent,
} from "../interfaces";

export class LeasingFactoryService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor() {
    const networkConfig = handleNetwork();
    this.contractAddress = networkConfig.leasingFactory.address;

    // Initialize the contract with read-only provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      leasingFactoryABI,
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
    return createContract(this.contractAddress, leasingFactoryABI, wallet);
  }

  // Read functions (view functions)

  /**
   * Get base leasing core address
   * @returns Base leasing core contract address
   */
  async getBaseLeasingCore(): Promise<string> {
    try {
      console.log("🔍 Fetching base leasing core address...");

      const result = await this.contract.baseLeasingCore();
      return result;
    } catch (error) {
      console.error("❌ Error fetching base leasing core:", error);
      throw new Error(`Failed to fetch base leasing core: ${error}`);
    }
  }

  /**
   * Get base leasing token address
   * @returns Base leasing token contract address
   */
  async getBaseLeasingToken(): Promise<string> {
    try {
      console.log("🔍 Fetching base leasing token address...");

      const result = await this.contract.baseLeasingToken();
      return result;
    } catch (error) {
      console.error("❌ Error fetching base leasing token:", error);
      throw new Error(`Failed to fetch base leasing token: ${error}`);
    }
  }

  /**
   * Get COP$ address used by the factory
   * @returns COP$ contract address
   */
  async getUsdcAddress(): Promise<string> {
    try {
      console.log("🔍 Fetching COP$ address...");

      const result = await this.contract.usdcAddress();
      return result;
    } catch (error) {
      console.error("❌ Error fetching COP$ address:", error);
      throw new Error(`Failed to fetch COP$ address: ${error}`);
    }
  }

  /**
   * Get all factory configuration addresses
   * @returns LeasingFactoryConfig object with all addresses
   */
  async getFactoryConfig(): Promise<LeasingFactoryConfig> {
    try {
      console.log("🔍 Fetching factory configuration...");

      const [baseLeasingCore, baseLeasingToken, usdcAddress] =
        await Promise.all([
          this.getBaseLeasingCore(),
          this.getBaseLeasingToken(),
          this.getUsdcAddress(),
        ]);

      return {
        baseLeasingCore,
        baseLeasingToken,
        usdcAddress,
      };
    } catch (error) {
      console.error("❌ Error fetching factory configuration:", error);
      throw new Error(`Failed to fetch factory configuration: ${error}`);
    }
  }

  // Write functions (require private key for signing)

  /**
   * Create a new leasing contract
   * @param params - Parameters for creating the leasing contract
   * @param privateKey - Private key for signing the transaction
   * @returns Transaction receipt
   */
  async createLeasing(
    params: CreateLeasingParams,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log("🏗️ Creating new leasing contract...");

      const contractWithSigner = await this.getContractWithSigner(privateKey);

      const tx = await contractWithSigner.createLeasing(
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

      console.log("✅ Transaction sent:", tx.hash);
      const receipt = await tx.wait();

      // Log the created leasing addresses if available in events
      if (receipt && receipt.logs) {
        const leasingCreatedEvent = this.parseLeasingCreatedEvent(receipt.logs);
        if (leasingCreatedEvent) {
          console.log("🎉 Leasing created successfully:", leasingCreatedEvent);
        }
      }

      return receipt;
    } catch (error) {
      console.error("❌ Error creating leasing:", error);
      throw new Error(`Failed to create leasing: ${error}`);
    }
  }

  // Event parsing utilities

  /**
   * Parse LeasingCreated event from transaction logs
   * @param logs - Transaction logs
   * @returns Parsed LeasingCreated event or null if not found
   */
  private parseLeasingCreatedEvent(logs: any[]): LeasingCreatedEvent | null {
    try {
      const iface = new ethers.Interface(leasingFactoryABI);

      for (const log of logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog && parsedLog.name === "LeasingCreated") {
            return {
              leasingCore: parsedLog.args.leasingCore,
              leasingToken: parsedLog.args.leasingToken,
            };
          }
        } catch (e) {
          // Continue to next log if this one can't be parsed
          console.log("❌ Error parsing LeasingCreated event:", e);
          continue;
        }
      }
      return null;
    } catch (error) {
      console.error("❌ Error parsing LeasingCreated event:", error);
      return null;
    }
  }

  /**
   * Set up event listener for LeasingCreated events
   * @param callback - Function to call when event is emitted
   * @returns Function to remove the listener
   */
  onLeasingCreated(callback: (event: LeasingCreatedEvent) => void): () => void {
    // Set up event listener
    const listener = (leasingCore: string, leasingToken: string) => {
      callback({ leasingCore, leasingToken });
    };

    this.contract.on("LeasingCreated", listener);

    // Return cleanup function
    return () => {
      this.contract.off("LeasingCreated", listener);
    };
  }

  // ============ NEW THRESHOLD-RELATED FUNCTIONS ============

  /**
   * Create leasing contracts from a threshold campaign
   * @param thresholdCampaign - Threshold campaign address
   * @param privateKey - Private key for signing transaction
   * @returns Created leasing contracts addresses and transaction receipt
   */
  async createLeasingFromThreshold(
    thresholdCampaign: string,
    privateKey: string
  ): Promise<{
    leasingCore: string;
    leasingToken: string;
    receipt: ethers.ContractTransactionReceipt | null;
  }> {
    try {
      console.log(
        `🏭 Creating leasing from threshold campaign: ${thresholdCampaign}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.createLeasingFromThreshold(
        thresholdCampaign
      );

      console.log("✅ Threshold leasing creation transaction sent:", tx.hash);
      const receipt = await tx.wait();

      // Parse the event to get the created addresses
      let leasingCore = "";
      let leasingToken = "";

      if (receipt && receipt.logs) {
        const event = this.parseLeasingCreatedFromThresholdEvent(receipt.logs);
        if (event) {
          leasingCore = event.leasingCore;
          leasingToken = event.leasingToken;
          console.log("🎉 Leasing created from threshold:", event);
        }
      }

      return { leasingCore, leasingToken, receipt };
    } catch (error) {
      console.error("❌ Error creating leasing from threshold:", error);
      throw new Error(`Failed to create leasing from threshold: ${error}`);
    }
  }

  /**
   * Authorize/deauthorize a threshold campaign
   * @param campaign - Campaign address
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

      console.log("✅ Campaign authorization transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error authorizing threshold campaign:", error);
      throw new Error(`Failed to authorize threshold campaign: ${error}`);
    }
  }

  /**
   * Authorize/deauthorize a threshold factory
   * @param factory - Factory address
   * @param authorized - Whether to authorize or deauthorize
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async authorizeThresholdFactory(
    factory: string,
    authorized: boolean,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `🔐 ${
          authorized ? "Authorizing" : "Deauthorizing"
        } threshold factory: ${factory}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.authorizeThresholdFactory(
        factory,
        authorized
      );

      console.log("✅ Factory authorization transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error authorizing threshold factory:", error);
      throw new Error(`Failed to authorize threshold factory: ${error}`);
    }
  }

  /**
   * Set factory authorization for specific campaign
   * @param factory - Factory address
   * @param campaign - Campaign address
   * @param authorized - Whether to authorize or deauthorize
   * @param privateKey - Private key for signing transaction
   * @returns Transaction receipt
   */
  async setFactoryAuthorization(
    factory: string,
    campaign: string,
    authorized: boolean,
    privateKey: string
  ): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      console.log(
        `🔐 Setting factory authorization: factory=${factory}, campaign=${campaign}, authorized=${authorized}`
      );

      const contractWithSigner = await this.getContractWithSigner(privateKey);
      const tx = await contractWithSigner.setFactoryAuthorization(
        factory,
        campaign,
        authorized
      );

      console.log("✅ Factory authorization transaction sent:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("❌ Error setting factory authorization:", error);
      throw new Error(`Failed to set factory authorization: ${error}`);
    }
  }

  // ============ NEW READ FUNCTIONS ============

  /**
   * Check if a threshold campaign is authorized
   * @param campaign - Campaign address
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
   * Check if a threshold factory is authorized
   * @param factory - Factory address
   * @returns True if factory is authorized
   */
  async isThresholdFactoryAuthorized(factory: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking if threshold factory is authorized: ${factory}`);
      const result = await this.contract.authorizedThresholdFactories(factory);
      return result;
    } catch (error) {
      console.error("❌ Error checking factory authorization:", error);
      throw new Error(`Failed to check factory authorization: ${error}`);
    }
  }

  /**
   * Check if factory is authorized for specific campaign
   * @param factory - Factory address
   * @param campaign - Campaign address
   * @returns True if factory is authorized for campaign
   */
  async isFactoryAuthorizedForCampaign(
    factory: string,
    campaign: string
  ): Promise<boolean> {
    try {
      console.log(
        `🔍 Checking factory authorization for campaign: factory=${factory}, campaign=${campaign}`
      );
      const result = await this.contract.isFactoryAuthorizedForCampaign(
        factory,
        campaign
      );
      return result;
    } catch (error) {
      console.error("❌ Error checking factory campaign authorization:", error);
      throw new Error(
        `Failed to check factory campaign authorization: ${error}`
      );
    }
  }

  /**
   * Get factory authorization for specific campaign
   * @param factory - Factory address
   * @param campaign - Campaign address
   * @returns True if authorized
   */
  async getFactoryAuthorization(
    factory: string,
    campaign: string
  ): Promise<boolean> {
    try {
      console.log(
        `🔍 Getting factory authorization: factory=${factory}, campaign=${campaign}`
      );
      const result = await this.contract.factoryAuthorizations(
        factory,
        campaign
      );
      return result;
    } catch (error) {
      console.error("❌ Error getting factory authorization:", error);
      throw new Error(`Failed to get factory authorization: ${error}`);
    }
  }

  // ============ EVENT PARSING UTILITIES ============

  /**
   * Parse LeasingCreatedFromThreshold event from transaction logs
   * @param logs - Transaction logs
   * @returns Parsed event or null if not found
   */
  private parseLeasingCreatedFromThresholdEvent(logs: any[]): {
    thresholdCampaign: string;
    leasingCore: string;
    leasingToken: string;
    totalRaised: bigint;
  } | null {
    try {
      const iface = new ethers.Interface(leasingFactoryABI);

      for (const log of logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog && parsedLog.name === "LeasingCreatedFromThreshold") {
            return {
              thresholdCampaign: parsedLog.args.thresholdCampaign,
              leasingCore: parsedLog.args.leasingCore,
              leasingToken: parsedLog.args.leasingToken,
              totalRaised: BigInt(parsedLog.args.totalRaised.toString()),
            };
          }
        } catch (e) {
          console.log("❌ Error parsing LeasingCreatedFromThreshold event:", e);
          continue;
        }
      }
      return null;
    } catch (error) {
      console.error(
        "❌ Error parsing LeasingCreatedFromThreshold event:",
        error
      );
      return null;
    }
  }
}
