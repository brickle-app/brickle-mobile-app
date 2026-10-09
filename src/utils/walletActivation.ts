export type WalletActivationStep = "fetching" | "deriving" | "verifying" | "securing" | "done";

export interface WalletActivationStepInfo {
  id: Exclude<WalletActivationStep, "done">;
  title: string;
  /** Short explanation shown under the active step. */
  detail: string;
}

export const WALLET_ACTIVATION_STEPS: WalletActivationStepInfo[] = [
  {
    id: "fetching",
    title: "Obteniendo tu respaldo cifrado",
    detail: "Solo tú puedes abrirlo con tus 12 palabras.",
  },
  {
    id: "deriving",
    title: "Generando tu clave de seguridad",
    detail: "Es el paso más largo: protege tu wallet de ataques de fuerza bruta.",
  },
  {
    id: "verifying",
    title: "Verificando tu wallet",
    detail: "Comprobamos que la dirección coincide con tu cuenta.",
  },
  {
    id: "securing",
    title: "Guardando en este dispositivo",
    detail: "Tu llave queda protegida en el almacenamiento seguro del teléfono.",
  },
];

const STEP_ORDER: WalletActivationStep[] = ["fetching", "deriving", "verifying", "securing", "done"];

export function getActivationStepIndex(step: WalletActivationStep): number {
  return STEP_ORDER.indexOf(step);
}

/** Share of the overall bar each phase owns. Key derivation dominates, so it gets most of the range. */
const PHASE_RANGES: Record<WalletActivationStep, [number, number]> = {
  fetching: [0, 0.06],
  deriving: [0.06, 0.9],
  verifying: [0.9, 0.95],
  securing: [0.95, 0.99],
  done: [1, 1],
};

/** Overall 0..1 progress from the current step and the 0..1 progress of the key derivation. */
export function computeActivationProgress(step: WalletActivationStep, derivationProgress: number): number {
  const [start, end] = PHASE_RANGES[step];
  if (step !== "deriving") return start;
  const clamped = Math.max(0, Math.min(1, derivationProgress));
  return Math.min(end, start + (end - start) * clamped);
}
