import { useEffect, useCallback } from "react";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";

/**
 * Hook que provee la configuración de contratos blockchain cargada desde el backend.
 * Evita redesplegar la app cuando se actualizan contratos.
 */
export function useBlockchainConfig() {
  const { config, isLoading, error, fetchConfig } = useBlockchainConfigStore();

  useEffect(() => {
    fetchConfig().catch(() => {
      // Error ya manejado en el store
    });
  }, [fetchConfig]);

  const ensureConfig = useCallback(async () => {
    const { config: currentConfig } = useBlockchainConfigStore.getState();
    if (currentConfig) return currentConfig;
    return fetchConfig();
  }, [fetchConfig]);

  return {
    baseToken: config?.baseToken ?? "",
    paymasterAddress: config?.paymasterAddress ?? "",
    thresholdFactory: config?.thresholdFactory ?? "",
    brickleNft: config?.brickleNft ?? "",
    chainId: config?.chainId ?? 80002,
    config,
    isLoading,
    error,
    ensureConfig,
  };
}
