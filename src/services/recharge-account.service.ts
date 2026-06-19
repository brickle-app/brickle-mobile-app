import copmAbi from "@/src/components/wallet/contracts/config/abis/usdc-mock.json";
import {
  createContract,
  getWallet,
} from "../components/wallet/contracts/config/clients/polygon";
import { authStore } from "../store/auth.store";
import { useBlockchainConfigStore } from "../store/blockchainConfig.store";

export const rechargeAccount = async () => {
  const privateKey = authStore.getState().privateKey;
  if (!privateKey) {
    throw new Error("Private key not found");
  }

  const { baseToken } = await useBlockchainConfigStore.getState().fetchConfig();
  const wallet = await getWallet(privateKey);
  const copmContract = createContract(
    baseToken,
    copmAbi,
    wallet
  );

  const tx = await copmContract.mint(
    wallet.address,
    (200000000 * 10 ** 6).toString()
  );
  console.log("tx", tx);
  await tx.wait();
};
