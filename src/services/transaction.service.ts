import { ethers } from "ethers";
import {
  getWallet,
  createContract,
} from "@/src/components/wallet/contracts/config/clients/polygon";
import usdcAbi from "@/src/components/wallet/contracts/config/abis/usdc-mock.json";
import { authStore } from "@/src/store/auth.store";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import { notifyIncomingTransferToPeer } from "@/src/services/brickle.service";

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface ContactTransferData {
  recipientAddress: string;
  amount: string;
}

export const transferToContact = async (
  data: ContactTransferData
): Promise<TransactionResult> => {
  try {
    const { balance, user } = authStore.getState();

    if (!user?.externalWalletId) {
      return {
        success: false,
        error: "No se encontró el wallet del usuario",
      };
    }

    if (!balance || parseFloat(balance) < parseFloat(data.amount)) {
      return {
        success: false,
        error: "Saldo insuficiente para realizar la transferencia",
      };
    }

    const privateKey = authStore.getState().privateKey;
    
    if (!privateKey) {
      return {
        success: false,
        error: "No se pudo obtener la clave privada del wallet"
      };
    }

    const { baseToken } = await useBlockchainConfigStore.getState().fetchConfig();
    const wallet = await getWallet(privateKey);
    const usdcContract = createContract(
      baseToken,
      usdcAbi,
      wallet
    );

    const decimals = await usdcContract.decimals();
    const amount = ethers.parseUnits(data.amount, decimals);

    const contractBalance = await usdcContract.balanceOf(wallet.address);
    if (contractBalance < amount) {
      return {
        success: false,
        error: "Saldo insuficiente en el contrato",
      };
    }

    const tx = await usdcContract.transfer(data.recipientAddress, amount);
    const receipt = await tx.wait();

    const newBalance = (
      parseFloat(balance) - parseFloat(data.amount)
    ).toString();
    authStore.getState().setBalance(newBalance);

    const senderEmail = authStore.getState().user?.email;
    if (senderEmail) {
      void notifyIncomingTransferToPeer({
        senderEmail,
        recipientWalletAddress: data.recipientAddress,
        amount: data.amount,
        transactionHash: receipt.hash,
      });
    }

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al procesar la transferencia",
    };
  }
};

export const getUSDCBalance = async (address: string): Promise<string> => {
  try {
    const { baseToken } = await useBlockchainConfigStore.getState().fetchConfig();
    const usdcContract = createContract(baseToken, usdcAbi);

    const balance = await usdcContract.balanceOf(address);
    const decimals = await usdcContract.decimals();

    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error getting USDC balance:", error);
    return "0";
  }
};
