/** Borde alrededor de la foto (Discover). */
export const TRENDING_IMAGE_BORDER_PX = 4;

/** Lado interior de la imagen (cuadrado 1:1). */
export const TRENDING_INNER_IMAGE_PX = 92;

export const TRENDING_IMAGE_FRAME_PX =
  TRENDING_INNER_IMAGE_PX + 2 * TRENDING_IMAGE_BORDER_PX;

export const TRENDING_CARD_RADIUS = 16;

/** Radio en esquinas izquierdas del área interior (foto), alineado al marco. */
export const TRENDING_INNER_LEFT_RADIUS_PX = Math.max(
  0,
  TRENDING_CARD_RADIUS - TRENDING_IMAGE_BORDER_PX
);

/** Esquinas inferiores redondeadas de la “bandera” del logo (superior cuadrada). */
export const TRENDING_LOGO_FLAG_BOTTOM_RADIUS_PX = 8;
