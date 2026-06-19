const BRICKS_DECIMALS_FACTOR = 1_000_000n;

/**
 * Dos escalas posibles del token BRICKS:
 * - Nominal (mint ≈ bricks × 10⁶): PolygonScan y la app muestran cantidades del orden de los bricks (p. ej. 8, 1,14 quemados).
 * - Capital / micro-COP (mint ≈ COP comprometido en micro): el suministro raw es enorme; bricks “de catálogo” ≈ saldo ÷ leasingTokenPrice;
 *   capital en COP ≈ saldo ÷ 10⁶. La quema por cuota es minúscula frente al saldo raw, no resta ~1 brick del catálogo por pago.
 */
export function isNominalBricksScale(totalSupplyRaw: bigint, catalogBricks: number): boolean {
  if (catalogBricks <= 0 || totalSupplyRaw <= 0n) return false;
  const supplyHuman = totalSupplyRaw / BRICKS_DECIMALS_FACTOR;
  const cat = BigInt(catalogBricks);
  if (cat <= 0n) return false;
  return supplyHuman <= cat * 4n && supplyHuman * 4n >= cat;
}

const COP_VS_NOMINAL_SUPPLY_FACTOR = 100n;

/**
 * `true` si el BRICKS ERC20 representa micro-COP on-chain (Campaign mint con `_totalCommitted`), no “1 brick = 10⁶ raw”.
 * Usa `totalLeasingTokens` del LeasingCore: si supply raw >> bricks × 10⁶ × factor, es escala capital.
 */
export function isCopMicroLeasingToken(
  totalSupplyRaw: bigint,
  totalLeasingTokensOnChain: bigint,
  catalogBricksFallback: number
): boolean {
  if (totalSupplyRaw <= 0n) return false;
  const bricksRef =
    totalLeasingTokensOnChain > 0n
      ? totalLeasingTokensOnChain
      : BigInt(Math.max(1, Math.floor(catalogBricksFallback > 0 ? catalogBricksFallback : 1)));
  const nominalCeiling = bricksRef * BRICKS_DECIMALS_FACTOR * COP_VS_NOMINAL_SUPPLY_FACTOR;
  return totalSupplyRaw > nominalCeiling;
}

function formatBricksQuantityNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toLocaleString("es-CO", { maximumFractionDigits: 6 });
}

/** BRICKS con 6 decimales: misma cifra que el explorador (saldo raw ÷ 10⁶). */
export function formatBricksTokenHuman(balanceRaw: bigint): string {
  if (balanceRaw === 0n) return "0";
  const n = Number(balanceRaw) / 1e6;
  return formatBricksQuantityNumber(n);
}

/** Cantidad de bricks (decimal) ya en unidades humanas, p. ej. bricks quemados acumulados. */
export function formatBricksDecimalQuantity(quantity: number): string {
  return formatBricksQuantityNumber(quantity);
}

/**
 * Capital en COP (entero) en escala nominal: (saldo raw × precio COP/brick) ÷ 10⁶.
 * Evita decimales fantasma frente a float; alinea con bricks actuales × valor por token.
 */
export function nominalCapitalCopIntegerFromRaw(balanceRaw: bigint, pricePerTokenCop: number): number {
  if (balanceRaw === 0n) return 0;
  const p = BigInt(Math.max(0, Math.floor(Number.isFinite(pricePerTokenCop) ? pricePerTokenCop : 0)));
  if (p === 0n) return 0;
  return Number((balanceRaw * p) / BRICKS_DECIMALS_FACTOR);
}

/**
 * Saldo en escala capital (micro-COP del aporte): COP ≈ raw ÷ 10⁶.
 */
export function rawBalanceToCapitalCopAmount(balanceRaw: bigint): number {
  if (balanceRaw === 0n) return 0;
  return Number(balanceRaw) / 1e6;
}

/**
 * Precio por brick en micro-unidades: prioriza `leasingTokenPrice` del contrato; si es 0, `pricePerTokenCop` (COP enteros) × 10^6.
 */
export function resolvePricePerBrickMicro(onChainPriceMicro: bigint, pricePerTokenCop: number): bigint {
  if (onChainPriceMicro > 0n) return onChainPriceMicro;
  const cop = Math.max(0, Math.floor(Number.isFinite(pricePerTokenCop) ? pricePerTokenCop : 0));
  return BigInt(cop) * 1_000_000n;
}

/**
 * Bricks (escala capital): saldo raw ÷ leasingTokenPrice.
 */
export function formatCurrentBricks(balanceRaw: bigint, pricePerBrickMicro: bigint): string {
  if (pricePerBrickMicro === 0n) return "—";
  if (balanceRaw === 0n) return "0";
  const n = Number(balanceRaw) / Number(pricePerBrickMicro);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toLocaleString("es-CO", { maximumFractionDigits: 6 });
}

/**
 * Si el log de app dice «Cuota N» con N mayor al plazo mensual, es el cierre (residual + bono), no una cuota extra.
 */
export function rewriteRentClaimLogDescription(reference: string, termMonths: number): string {
  if (!reference || termMonths <= 0) return reference;
  const m = reference.match(/cuota\s*(\d+)/i);
  if (!m) return reference;
  const installment = parseInt(m[1], 10);
  if (Number.isNaN(installment) || installment <= termMonths) return reference;
  const base = reference.replace(/\s*-\s*cuota\s*\d+.*$/i, "").trim();
  const prefix = base.length > 0 ? `${base} — ` : "Renta reclamada — ";
  return `${prefix}residual y bono de permanencia`;
}
