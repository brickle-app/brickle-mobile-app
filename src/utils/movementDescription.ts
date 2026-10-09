/**
 * The backend stores the movement text as "Compra de <activo> - 2 tokens" and the product speaks of
 * bricks. Normalizes the wording and the singular/plural without touching asset names.
 */
export function formatMovementDescription(raw: string): string {
  return raw
    .replace(/Inversi[óo]n\s+en/gi, "Compra de")
    .replace(/Inversi[óo]n/gi, "Compra")
    .replace(/\[Intereses\]/gi, "[Rendimiento]")
    .replace(/Intereses/gi, "Rendimiento")
    .replace(/(\d+)\s+tokens?\b/gi, (_match, count: string) => `${count} ${Number(count) === 1 ? "brick" : "bricks"}`);
}
