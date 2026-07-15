import { PartialBrickleUser } from "@/src/types/user.types";

type WalletVerificationUser = Pick<
  PartialBrickleUser,
  "isBasicProfileComplete" | "isFullProfileComplete" | "isProfileUnderReview"
>;

export function getWalletVerificationNotice(user?: WalletVerificationUser | null) {
  if (!user?.isBasicProfileComplete || user.isFullProfileComplete) {
    return null;
  }

  if (user.isProfileUnderReview) {
    return {
      title: "Documentación en validación",
      message: "Las funciones de recargar y retirar estarán disponibles cuando validemos tu documentación.",
    };
  }

  return null;
}
