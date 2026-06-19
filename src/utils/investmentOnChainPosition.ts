import { Investment } from "@/src/interfaces/investments.interface";
import type { InvestorOnChainSnapshot } from "@/src/utils/leasingInvestorReads";
import {
  formatBricksTokenHuman,
  formatCurrentBricks,
  isCopMicroLeasingToken,
  nominalCapitalCopIntegerFromRaw,
  rawBalanceToCapitalCopAmount,
  resolvePricePerBrickMicro,
} from "@/src/utils/bricksFormat";

/** Bricks / capital según datos de servidor (compra); no refleja quemas on-chain. */
export function bricksForInvestment(inv: Investment): number {
  if (inv.bricksCount != null && inv.bricksCount > 0) {
    return Math.round(inv.bricksCount);
  }
  const price = inv.leasing?.pricePerToken ?? 0;
  if (price <= 0) return 0;
  return Math.floor(inv.amount / price);
}

function catalogBricksForAsset(inv: Investment): number {
  const t = inv.leasing?.tokens;
  if (t != null && Number(t) > 0) return Math.round(Number(t));
  return 0;
}

export interface InvestmentOnChainPosition {
  /** Capital vigente en COP alineado con detalle de inversión (post-quema). */
  capitalCop: number;
  /** Texto de bricks actuales (misma escala que pantalla detalle). */
  bricksLabel: string;
  /** Para ordenar por tamaño de posición (aprox. bricks humanos). */
  bricksSortKey: number;
  /** Si hubo lectura on-chain usable (wallet + contrato). */
  hasOnChainData: boolean;
}

/**
 * Capital y bricks visibles al usuario a partir del snapshot on-chain.
 * Si no hay snapshot, conserva comportamiento previo (API estática).
 */
export function computeInvestmentOnChainPosition(
  inv: Investment,
  snap: InvestorOnChainSnapshot | undefined
): InvestmentOnChainPosition {
  const asset = inv.leasing;
  if (!snap || !asset?.contractAddress) {
    const bricks = bricksForInvestment(inv);
    return {
      capitalCop: inv.amount,
      bricksLabel: String(bricks),
      bricksSortKey: bricks,
      hasOnChainData: false,
    };
  }

  const pricePerBrickMicro = resolvePricePerBrickMicro(
    snap.leasingTokenPriceMicro,
    asset.pricePerToken ?? 0
  );
  const catalogBricks = catalogBricksForAsset(inv);
  const isCapitalScaleBrickToken = isCopMicroLeasingToken(
    snap.leasingTokenTotalSupply,
    snap.coreTotalLeasingTokens,
    catalogBricks
  );
  const isNominalBrickScale = !isCapitalScaleBrickToken;

  const balance = snap.leasingTokenBalance;

  const capitalCop =
    balance === 0n
      ? 0
      : isNominalBrickScale
        ? nominalCapitalCopIntegerFromRaw(balance, asset.pricePerToken ?? 0)
        : rawBalanceToCapitalCopAmount(balance);

  const bricksLabel =
    balance === 0n
      ? "0"
      : isNominalBrickScale
        ? formatBricksTokenHuman(balance)
        : formatCurrentBricks(balance, pricePerBrickMicro);

  let bricksSortKey = 0;
  if (balance > 0n) {
    if (isNominalBrickScale) {
      bricksSortKey = Number(balance) / 1e6;
    } else if (pricePerBrickMicro > 0n) {
      bricksSortKey = Number(balance) / Number(pricePerBrickMicro);
    }
  }

  return {
    capitalCop,
    bricksLabel,
    bricksSortKey: Number.isFinite(bricksSortKey) ? bricksSortKey : 0,
    hasOnChainData: true,
  };
}
