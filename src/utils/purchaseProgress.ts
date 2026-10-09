export type PurchaseStep = "authorizing" | "signing" | "confirming" | "done";

export interface PurchaseStepInfo {
  id: Exclude<PurchaseStep, "done">;
  title: string;
  detail: string;
}

export const PURCHASE_STEPS: PurchaseStepInfo[] = [
  {
    id: "authorizing",
    title: "Verificando tu identidad",
    detail: "Desbloqueamos tu wallet de forma segura en este dispositivo.",
  },
  {
    id: "signing",
    title: "Firmando tu autorización",
    detail: "Firmas una sola vez el monto exacto de tu compra.",
  },
  {
    id: "confirming",
    title: "Confirmando tu inversión",
    detail: "Registramos tus bricks en la red. Puede tardar unos segundos.",
  },
];

const ORDER: PurchaseStep[] = ["authorizing", "signing", "confirming", "done"];

export function getPurchaseStepIndex(step: PurchaseStep): number {
  return ORDER.indexOf(step);
}
