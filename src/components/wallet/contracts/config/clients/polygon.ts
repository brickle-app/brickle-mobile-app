import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  process.env.EXPO_PUBLIC_POLYGON_RPC || "",
  {
    chainId: 80002,
    name: "matic-amoy",
    ensAddress: undefined, // Disable ENS
  },
  {
    staticNetwork: true,
  }
);

const getNetwork = async () => {
  return await provider.getNetwork();
};

const getWallet = async (privateKey: string) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

const createContract = (address: string, abi: any, wallet?: ethers.Wallet) => {
  const contract = new ethers.Contract(address, abi, wallet || provider);
  return contract;
};

export { provider, getNetwork, getWallet, createContract };
