import { PaymentProofImage } from "./paymentDetailsModal.types";

export const isPaymentProofReady = (
  uploadedImage: PaymentProofImage,
  paymentProofUrl: string | null,
  isUploading: boolean
) => Boolean(uploadedImage?.uri && paymentProofUrl && !isUploading);

export const getPaymentProofLabel = (
  uploadedImage: PaymentProofImage,
  paymentProofUrl: string | null,
  isUploading: boolean
) => {
  if (isUploading) return "Subiendo...";
  if (isPaymentProofReady(uploadedImage, paymentProofUrl, false)) return "Comprobante cargado";
  if (uploadedImage?.uri) return "No se pudo cargar. Toca para intentar de nuevo";
  return "Toca para subir\ntu comprobante";
};

export const BRICKLE_BANK_INFO = {
  type: "Ahorros",
  bankName: "Bancolombia",
  accountNumber: "25900003125",
  accountHolder: "Brickle S.A.S",
  nit: "901.234.567-8",
  keyBreb: "0090013737",
} as const;
