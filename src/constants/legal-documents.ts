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

// TODO: reemplazar por la URL pública definitiva una vez el documento
// "BRICKLE - Contrato colaboración empresarial" sea aprobado y publicado en brickle.app.
export const BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Contrato_colaboracion_empresarial.pdf";

// TODO: reemplazar por la URL pública definitiva una vez el documento
// "Declaracion_Origen_Fondos_App_Brickle" sea aprobado y publicado en brickle.app.
export const BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Declaracion_origen_de_fondos.pdf";

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
  {
    id: "business-collaboration-contract",
    title: "Contrato de colaboración empresarial",
    url: BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL,
  },
  {
    id: "origin-of-funds-declaration",
    title: "Declaración de origen de fondos",
    url: BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL,
  },
];

/** Documentos que el usuario debe aceptar explícitamente al completar su perfil. */
export const PROFILE_CONSENT_DOCUMENTS: LegalDocumentDefinition[] = [
  {
    id: "terms",
    title: "Términos y condiciones",
    url: BRICKLE_TERMS_AND_CONDITIONS_PDF_URL,
  },
  {
    id: "business-collaboration-contract",
    title: "Contrato de colaboración empresarial",
    url: BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL,
  },
  {
    id: "origin-of-funds-declaration",
    title: "Declaración de origen de fondos",
    url: BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL,
  },
];
