/**
 * URLs de documentos legales (PDF en brickle.app).
 */
export const BRICKLE_TERMS_AND_CONDITIONS_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Terminos_y_condiciones_20102025.pdf";

export const BRICKLE_PRIVACY_POLICY_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Politica_de_privacidad_20102025.pdf";

/** Página HTML de políticas (fallback o enlaces web). */
export const BRICKLE_PRIVACY_POLICY_WEB_URL =
  "https://brickle.app/politicas-de-privacidad";

export interface LegalDocumentDefinition {
  id: string;
  title: string;
  /** URL del PDF o página a mostrar en el WebView */
  url: string;
}

export const LEGAL_DOCUMENTS: LegalDocumentDefinition[] = [
  {
    id: "terms",
    title: "Términos y condiciones",
    url: BRICKLE_TERMS_AND_CONDITIONS_PDF_URL,
  },
  {
    id: "privacy",
    title: "Política de tratamiento de datos",
    url: BRICKLE_PRIVACY_POLICY_PDF_URL,
  },
];
