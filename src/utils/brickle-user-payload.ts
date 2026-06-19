import {
  BrickleUserUpdateRequest,
  PartialBrickleUser,
} from "@/src/types/user.types";
import { parseDateToISO } from "@/src/utils/date.utility";

function normalizeDateOfBirth(
  value: Date | string | undefined | null
): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? undefined
      : value.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      try {
        return parseDateToISO(trimmed);
      } catch {
        return undefined;
      }
    }
    const normalized = trimmed.includes("/")
      ? trimmed.replace(/\//g, "-")
      : trimmed;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
  }
  return undefined;
}

/**
 * Construye un cuerpo PUT seguro para /api/User sin spread del objeto en memoria
 * (evita fechas mal tipadas tras rehidratación o KYC).
 */
export function toBrickleUserUpdatePayload(
  user: PartialBrickleUser
): BrickleUserUpdateRequest | null {
  if (!user.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    profilePictureUrl: user.profilePictureUrl ?? undefined,
    walletAddress: user.walletAddress,
    termsAccepted: user.termsAccepted,
    dateOfBirth: normalizeDateOfBirth(user.dateOfBirth as Date | string),
    nationality: user.nationality,
    countryOfResidence: user.countryOfResidence,
    documentType: user.documentType,
    documentNumber: user.documentNumber,
    kycCustomerId: user.kycCustomerId,
    isBasicProfileComplete: user.isBasicProfileComplete,
    isFullProfileComplete: user.isFullProfileComplete,
    isProfileUnderReview: user.isProfileUnderReview,
    fullName: user.fullName,
    pushNotificationToken: user.pushNotificationToken,
    externalWalletId: user.externalWalletId ?? undefined,
    currentSession: user.currentSession ?? undefined,
  };
}
