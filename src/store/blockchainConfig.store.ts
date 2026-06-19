import { create } from "zustand";
import { brickleClient } from "@/src/lib/api/axios-brickle.client";

export interface BlockchainConfig {
  baseToken: string;
  paymasterAddress: string;
  thresholdFactory: string;
  brickleNft: string;
  chainId: number;
}

export interface NetworkConfig {
  usdcMock: { address: string };
  leasingCore: { address: string };
  leasingToken: { address: string };
  leasingNft: { address: string };
  leasingFactory: { address: string };
  thresholdCampaign: { address: string };
  thresholdFactory: { address: string };
}

export interface FetchBlockchainConfigOptions {
  /** Si true, ignora la caché y vuelve a pedir al API (útil tras redespliegue de contratos). */
  force?: boolean;
}

interface BlockchainConfigState {
  config: BlockchainConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: (options?: FetchBlockchainConfigOptions) => Promise<BlockchainConfig>;
  getBaseToken: () => string;
  getPaymasterAddress: () => string;
  getNetworkConfig: () => NetworkConfig | null;
}

const mapConfigToNetworkConfig = (config: BlockchainConfig): NetworkConfig => ({
  usdcMock: { address: config.baseToken },
  leasingCore: { address: "" },
  leasingToken: { address: "" },
  leasingNft: { address: config.brickleNft },
  leasingFactory: { address: "" },
  thresholdCampaign: { address: "" },
  thresholdFactory: { address: config.thresholdFactory },
});

export const useBlockchainConfigStore = create<BlockchainConfigState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  fetchConfig: async (options) => {
    const { config } = get();
    if (!options?.force && config) return config;

    set({ isLoading: true, error: null });
    try {
      const { data } = await brickleClient.get<{
        baseToken: string;
        paymasterAddress: string;
        thresholdFactory: string;
        brickleNft: string;
        chainId: number;
      }>("/api/config/blockchain");

      const configData: BlockchainConfig = {
        baseToken: data.baseToken ?? "",
        paymasterAddress: data.paymasterAddress ?? "",
        thresholdFactory: data.thresholdFactory ?? "",
        brickleNft: data.brickleNft ?? "",
        chainId: data.chainId ?? 80002,
      };

      set({ config: configData, isLoading: false, error: null });
      return configData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar configuración blockchain";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getBaseToken: () => get().config?.baseToken ?? "",
  getPaymasterAddress: () => get().config?.paymasterAddress ?? "",
  getNetworkConfig: () => {
    const config = get().config;
    return config ? mapConfigToNetworkConfig(config) : null;
  },
}));
