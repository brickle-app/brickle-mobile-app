import { ethers } from "ethers";
import { createContract } from "@/src/components/wallet/contracts/config/clients/polygon";
import leasingCoreAbi from "@/src/components/wallet/contracts/config/abis/leasing-core.json";
import { Investment } from "@/src/interfaces/investments.interface";
import { PartialBrickleUser } from "@/src/types/user.types";

/** Evita que ethers trate strings no hex como ENS (falla en Amoy / 80002). */
export function toChecksumEvmAddress(value: string | undefined | null): string | null {
  if (value == null || typeof value !== "string") return null;
  const s = value.trim();
  if (!s.startsWith("0x") || s.length < 42) return null;
  if (!ethers.isAddress(s)) return null;
  try {
    return ethers.getAddress(s);
  } catch {
    return null;
  }
}

function isBenignRpcReadError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("BAD_DATA") ||
    msg.includes("could not decode result data") ||
    msg.includes("UNSUPPORTED_OPERATION") ||
    msg.includes("getEnsAddress")
  );
}

const erc20BalanceOfAbi = [
  "function balanceOf(address account) view returns (uint256)",
] as const;

const erc20TotalSupplyAbi = ["function totalSupply() view returns (uint256)"] as const;

const leasingCoreTotalLeasingTokensAbi = ["function totalLeasingTokens() view returns (uint256)"] as const;

const POLL_MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 1500;

function getLeasingCoreContract(address: string) {
  const normalized = toChecksumEvmAddress(address);
  if (!normalized) {
    throw new Error("Invalid leasing core address");
  }
  return createContract(normalized, leasingCoreAbi);
}

export function microToCopAmount(micro: bigint): number {
  return Number(micro) / 1e6;
}

export async function readClaimableMicro(
  leasingCoreAddress: string,
  walletAddress: string
): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  const wallet = toChecksumEvmAddress(walletAddress);
  if (!coreAddr || !wallet) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const v = await core.getClaimableEarnings(wallet);
    return BigInt(v.toString());
  } catch (e) {
    if (!isBenignRpcReadError(e)) {
      console.error("readClaimableMicro", e);
    }
    return 0n;
  }
}

export async function readClaimedEarningsMicro(
  leasingCoreAddress: string,
  walletAddress: string
): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  const wallet = toChecksumEvmAddress(walletAddress);
  if (!coreAddr || !wallet) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const v = await core.claimedEarnings(wallet);
    return BigInt(v.toString());
  } catch (e) {
    if (!isBenignRpcReadError(e)) {
      console.error("readClaimedEarningsMicro", e);
    }
    return 0n;
  }
}

export async function readLeasingTokenBalanceMicro(
  leasingCoreAddress: string,
  walletAddress: string
): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  const wallet = toChecksumEvmAddress(walletAddress);
  if (!coreAddr || !wallet) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const tokenAddr: string = await core.leasingToken();
    const tokenNorm = toChecksumEvmAddress(tokenAddr);
    if (!tokenNorm || tokenNorm.toLowerCase() === ethers.ZeroAddress.toLowerCase()) return 0n;
    const token = createContract(tokenNorm, erc20BalanceOfAbi);
    const v = await token.balanceOf(wallet);
    return BigInt(v.toString());
  } catch (e) {
    if (!isBenignRpcReadError(e)) {
      console.error("readLeasingTokenBalanceMicro", e);
    }
    return 0n;
  }
}

/**
 * Precio por brick en la misma escala que el LeasingCore (micro-unidades del token base, 6 decimales).
 * Coincide con `leasingInfo.leasingTokenPrice` on-chain.
 */
export async function readLeasingTokenPriceMicro(leasingCoreAddress: string): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  if (!coreAddr) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const li = await core.leasingInfo();
    const price = li?.leasingTokenPrice ?? li?.[3];
    if (price == null) return 0n;
    return BigInt(price.toString());
  } catch (e) {
    if (!isBenignRpcReadError(e)) {
      console.error("readLeasingTokenPriceMicro", e);
    }
    return 0n;
  }
}

export async function readLeasingTokenTotalSupplyRaw(leasingCoreAddress: string): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  if (!coreAddr) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const tokenAddr: string = await core.leasingToken();
    const tokenNorm = toChecksumEvmAddress(tokenAddr);
    if (!tokenNorm || tokenNorm.toLowerCase() === ethers.ZeroAddress.toLowerCase()) return 0n;
    const token = createContract(tokenNorm, erc20TotalSupplyAbi);
    const v = await token.totalSupply();
    return BigInt(v.toString());
  } catch (e) {
    if (!isBenignRpcReadError(e)) {
      console.error("readLeasingTokenTotalSupplyRaw", e);
    }
    return 0n;
  }
}

export async function readTotalLeasingTokens(leasingCoreAddress: string): Promise<bigint> {
  const coreAddr = toChecksumEvmAddress(leasingCoreAddress);
  if (!coreAddr) return 0n;
  try {
    const core = getLeasingCoreContract(coreAddr);
    const v = await core.totalLeasingTokens();
    return BigInt(v.toString());
  } catch (e) {
    try {
      const core = createContract(coreAddr, leasingCoreTotalLeasingTokensAbi);
      const v = await core.totalLeasingTokens();
      return BigInt(v.toString());
    } catch (e2) {
      if (!isBenignRpcReadError(e) && !isBenignRpcReadError(e2)) {
        console.error("readTotalLeasingTokens", e, e2);
      }
      return 0n;
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Tras un reclamo, el RPC puede devolver saldo stale; reintenta hasta ver 0 o agotar intentos.
 */
export async function pollClaimableMicroAfterClaim(
  leasingCoreAddress: string,
  walletAddress: string
): Promise<bigint> {
  let last = await readClaimableMicro(leasingCoreAddress, walletAddress);
  if (last === 0n) return 0n;

  for (let i = 1; i < POLL_MAX_ATTEMPTS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const next = await readClaimableMicro(leasingCoreAddress, walletAddress);
    if (next === 0n) return 0n;
    last = next;
  }
  return last;
}

export interface InvestorOnChainSnapshot {
  claimableMicro: bigint;
  claimedMicro: bigint;
  leasingTokenBalance: bigint;
  leasingTokenPriceMicro: bigint;
  leasingTokenTotalSupply: bigint;
  /** Bricks totales del leasing según LeasingCore (catálogo on-chain). */
  coreTotalLeasingTokens: bigint;
}

export async function loadInvestorOnChainSnapshot(
  investment: Investment,
  user: PartialBrickleUser
): Promise<InvestorOnChainSnapshot> {
  const addr = investment.leasing?.contractAddress;
  const wallet =
    toChecksumEvmAddress(user.walletAddress) ??
    toChecksumEvmAddress(user.externalWalletId ?? undefined);
  if (!addr || !wallet) {
    return {
      claimableMicro: 0n,
      claimedMicro: 0n,
      leasingTokenBalance: 0n,
      leasingTokenPriceMicro: 0n,
      leasingTokenTotalSupply: 0n,
      coreTotalLeasingTokens: 0n,
    };
  }
  const [
    claimableMicro,
    claimedMicro,
    leasingTokenBalance,
    leasingTokenPriceMicro,
    leasingTokenTotalSupply,
    coreTotalLeasingTokens,
  ] = await Promise.all([
    readClaimableMicro(addr, wallet),
    readClaimedEarningsMicro(addr, wallet),
    readLeasingTokenBalanceMicro(addr, wallet),
    readLeasingTokenPriceMicro(addr),
    readLeasingTokenTotalSupplyRaw(addr),
    readTotalLeasingTokens(addr),
  ]);
  return {
    claimableMicro,
    claimedMicro,
    leasingTokenBalance,
    leasingTokenPriceMicro,
    leasingTokenTotalSupply,
    coreTotalLeasingTokens,
  };
}
