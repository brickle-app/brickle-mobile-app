import { updateUser } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { DocumentTypeEnum } from "@/src/types/user.types";
import { PersonalDetailsFormData } from "@/src/schemes/personal-details-scheme";
import { formatDateForAPI, parseDateToISO } from "@/src/utils/date.utility";
import { toBrickleUserUpdatePayload } from "@/src/utils/brickle-user-payload";
import { useState } from "react";

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.includes("Brickle API Error")) {
    return error.message.replace(/^Brickle API Error:\s*/i, "").trim() || fallback;
  }
  return fallback;
}

export default function useUpdateUserProfile() {
  const user = authStore((state) => state.user);
  const kycFormData = authStore((state) => state.kycFormData);
  const setUser = authStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const updateUserProfile = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user?.id || !user.email) {
      return { ok: false, error: "Sesión no válida. Vuelve a iniciar sesión." };
    }

    const base = toBrickleUserUpdatePayload(user);
    if (!base) {
      return { ok: false, error: "No se pudo preparar los datos del usuario." };
    }

    let dateOfBirthIso: string | undefined =
      base.dateOfBirth == null
        ? undefined
        : typeof base.dateOfBirth === "string"
          ? base.dateOfBirth
          : base.dateOfBirth instanceof Date &&
              !Number.isNaN(base.dateOfBirth.getTime())
            ? base.dateOfBirth.toISOString().split("T")[0]
            : undefined;
    if (kycFormData?.birthDate) {
      try {
        dateOfBirthIso = parseDateToISO(kycFormData.birthDate);
      } catch {
        return {
          ok: false,
          error: "La fecha de nacimiento del formulario no es válida.",
        };
      }
    }

    setIsLoading(true);
    try {
      await updateUser({
        ...base,
        dateOfBirth: dateOfBirthIso,
        nationality: kycFormData?.nationality ?? base.nationality,
        countryOfResidence:
          kycFormData?.residenceCountry ?? base.countryOfResidence,
        documentType: kycFormData?.documentType ?? base.documentType,
        documentNumber: kycFormData?.documentNumber ?? base.documentNumber,
        isFullProfileComplete: true,
      });

      const parsedDob =
        dateOfBirthIso && !Number.isNaN(Date.parse(`${dateOfBirthIso}T12:00:00`))
          ? new Date(`${dateOfBirthIso}T12:00:00`)
          : user.dateOfBirth;

      setUser({
        ...user,
        dateOfBirth: parsedDob,
        nationality: kycFormData?.nationality ?? user.nationality,
        countryOfResidence:
          kycFormData?.residenceCountry ?? user.countryOfResidence,
        documentType: kycFormData?.documentType ?? user.documentType,
        documentNumber: kycFormData?.documentNumber ?? user.documentNumber,
        isFullProfileComplete: true,
        isBasicProfileComplete: true,
      });
      return { ok: true };
    } catch (error: unknown) {
      console.error("updateUserProfile", error);
      return {
        ok: false,
        error: apiErrorMessage(
          error,
          "No se pudo sincronizar tu perfil. Intenta de nuevo."
        ),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalDetails = async (
    formData: PersonalDetailsFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id || !user.email) {
      return { success: false, error: "Sesión no válida." };
    }

    const base = toBrickleUserUpdatePayload(user);
    if (!base) {
      return { success: false, error: "No se pudo preparar los datos del usuario." };
    }

    setIsLoading(true);

    try {
      const formattedDate = formatDateForAPI(formData.dateOfBirth);

      await updateUser({
        ...base,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formattedDate,
        nationality: formData.nationality,
        countryOfResidence: formData.countryOfResidence,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
      });

      const dobLocal = new Date(formattedDate.replace(/\//g, "-") + "T12:00:00");
      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: Number.isNaN(dobLocal.getTime())
          ? user.dateOfBirth
          : dobLocal,
        nationality: formData.nationality,
        countryOfResidence: formData.countryOfResidence,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        fullName: `${formData.firstName} ${formData.lastName}`,
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("updatePersonalDetails", error);
      return {
        success: false,
        error: apiErrorMessage(
          error,
          "No se pudieron actualizar los datos. Intenta de nuevo."
        ),
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    updatePersonalDetails,
    isLoading,
  };
}
