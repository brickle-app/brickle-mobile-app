import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import type { NetworkConfig } from "@/src/store/blockchainConfig.store";

/**
 * Obtiene la configuración de red desde el API (blockchain config).
 * Requiere que fetchConfig() se haya llamado antes (ej: useBlockchainConfig en el layout).
 */
export const handleNetwork = (): NetworkConfig => {
  const networkConfig = useBlockchainConfigStore.getState().getNetworkConfig();
  if (!networkConfig) {
    throw new Error(
      "Configuración blockchain no cargada. Asegúrate de llamar fetchConfig() antes de usar los servicios de contratos."
    );
  }
  return networkConfig;
};
