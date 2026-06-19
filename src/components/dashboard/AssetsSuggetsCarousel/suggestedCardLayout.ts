/** Coincide con `contentContainerClassName="p-4"` del dashboard (16 × 2). */
export const DASHBOARD_SCROLL_PADDING_X = 32;

export const SUGGESTED_CARD_GAP = 10;

/** Parte superior (imagen) ~55–60 % de la tarjeta; el resto es el bloque de texto/color. */
export const SUGGESTED_CARD_IMAGE_HEIGHT_FRACTION = 0.58;

export function getSuggestedCardSize(windowWidth: number): number {
  return (windowWidth - DASHBOARD_SCROLL_PADDING_X - SUGGESTED_CARD_GAP) / 2;
}
