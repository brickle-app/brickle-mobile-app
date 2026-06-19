import { useCallback } from "react";
import { authStore } from "@/src/store/auth.store";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import { ethers } from "ethers";
import { createContract } from "../contracts/config/clients/polygon";

export const useWallet = () => {
  const { user } = authStore();
  const wallet = user?.walletAddress;

  const getBalance = useCallback(async () => {
    try {
      if (!wallet) return "0.00";

      const { baseToken } = await useBlockchainConfigStore.getState().fetchConfig();
      const contract = createContract(
        baseToken,
        [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ]
      );

      const [balance, decimals] = await Promise.all([
        contract.balanceOf(wallet),
        contract.decimals(),
      ]);

      return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2);
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return "0.00";
    }
  }, [wallet]);

  return {
    getBalance,
    wallet,
  };
};
