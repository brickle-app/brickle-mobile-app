import { Investment } from "../interfaces/investments.interface";
import { PartialBrickleUser } from "../types/user.types";
import { readClaimableMicro, toChecksumEvmAddress } from "./leasingInvestorReads";

export const getEarnings = async (investment: Investment, user: PartialBrickleUser) => {
  const wallet =
    toChecksumEvmAddress(user?.walletAddress) ??
    toChecksumEvmAddress(user?.externalWalletId ?? undefined);
  if (!investment?.leasing?.contractAddress || !wallet) {
    return 0n;
  }

  try {
    return await readClaimableMicro(
      investment.leasing.contractAddress,
      wallet
    );
  } catch (error) {
    console.error("Error fetching claimable earnings:", error);
    return 0n;
  }
};
