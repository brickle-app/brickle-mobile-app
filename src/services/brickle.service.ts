import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { isAxiosError } from "axios";
import {
  CreateBrickleUserRequest,
  CreateBrickleUserResponse,
  BrickleUserUpdateRequest,
  BrickleUser,
} from "../types/user.types";
import uuid from "react-native-uuid";
import { BRICKLE_SOURCE, APP_VERSION_CHECK_URL } from "../utils/constants";
import { AppVersionInfo } from "../types/app.types";
import * as ImagePicker from "expo-image-picker";
import { sanitizeUploadImage } from "../utils/secureUpload";
import { buildMultipartUploadHeaders } from "./brickleUploadHeaders";
import { Contact } from "../types/forms";
import {
  CommitFunds,
  Asset,
  Investment,
  PortfolioChartDto,
  ClaimRent,
  ProjectionPointDto,
  AmortizationTable,
} from "../interfaces/investments.interface";

export class BrickleService {
  constructor() {
    // Validate required environment variables
    if (!process.env.EXPO_PUBLIC_BRICKLE_API_URL) {
      console.error("EXPO_PUBLIC_BRICKLE_API_URL is not configured");
    }
  }

  async createUser(
    userData: CreateBrickleUserRequest
  ): Promise<CreateBrickleUserResponse> {
    try {
      const response = await brickleClient.post<CreateBrickleUserResponse>(
        `/api/User`,
        userData,
        {
          headers: {
            correlationId: uuid.v4(),
            user: userData.email,
            source: BRICKLE_SOURCE,
            RequestDate: new Date().toISOString(),
          },
        }
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (__DEV__) console.log(error.response?.status);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unknown Brickle API error";
        throw new Error(`Brickle API Error: ${errorMessage}`);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const response = await brickleClient.get<CreateBrickleUserResponse>(
        `/api/User/email/${email}`,
        {
          headers: {
            correlationId: uuid.v4(),
            user: email,
            source: BRICKLE_SOURCE,
            RequestDate: new Date().toISOString(),
          },
        }
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (__DEV__) console.log(error.response?.status);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unknown Brickle API error";
        console.log(errorMessage);
        return null;
      } else {
        console.log("Non-axios error:", error);
        return null;
      }
    }
  }
}

export const updateUser = async (userData: BrickleUserUpdateRequest) => {
  if (!userData.id) {
    console.warn("updateUser called with undefined id, skipping");
    return;
  }
  try {
    await brickleClient.put<CreateBrickleUserResponse>(
      `/api/User/${userData.id}`,
      {
        ...userData,
      },
      {
        headers: {
          correlationId: uuid.v4(),
          user: userData.email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    if (isAxiosError(error)) {
      if (__DEV__) console.log(error.response?.status);
      if (__DEV__ && error.response?.data) {
        console.log("Brickle updateUser validation error:", error.response.data);
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors)
          : undefined) ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const getInvestmentsGroupedByCategory = async (
  email: string,
  active: boolean = true,
  category?: string
) => {
  try {
    const response = await brickleClient.get<Asset[]>(
      `/api/Leasing/grouped?groupCategory=${category || "latestSold"
      }&active=${active}`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (__DEV__) console.log(error.response?.status);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const getInvestmentsByUserId = async (email: string, userId: string) => {
  try {
    const response = await brickleClient.get<Investment[]>(
      `/api/Investment/user/${userId}`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const getInvestmentForUserLeasing = async (
  email: string,
  userId: string,
  leasingId: string
): Promise<Investment | null> => {
  const list = await getInvestmentsByUserId(email, userId);
  return list.find((i) => i.leasingId === leasingId) ?? null;
};

export const getAssetById = async (
  assetId: string,
  email: string
): Promise<Asset | null> => {
  try {
    const response = await brickleClient.get<Asset>(`/api/Leasing/${assetId}`, {
      headers: {
        correlationId: uuid.v4(),
        user: email,
        source: BRICKLE_SOURCE,
        RequestDate: new Date().toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const uploadUserProfileImage = async (
  user: BrickleUser,
  image: ImagePicker.ImagePickerAsset
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", user.id);
    formData.append("File", sanitizeUploadImage(image, "User.Profile") as any);

    const response = await brickleClient.post<{ fileUrl: string }>(
      `/api/File`,
      formData,
      {
        headers: {
          ...buildMultipartUploadHeaders(),
          correlationId: uuid.v4(),
          user: user.email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    const fileUrl = response.data.fileUrl;

    if (!fileUrl) {
      throw new Error("File URL is null");
    }

    await updateUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profilePictureUrl: fileUrl,
      termsAccepted: user.termsAccepted,
      email: user.email,
    });

    return fileUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export type UserDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type UserDocumentType = "IDENTITY" | "BANK_CERTIFICATE";

export const USER_DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  IDENTITY: "Documento de Identidad",
  BANK_CERTIFICATE: "Certificado Bancario",
};

export interface UserDocumentDto {
  id: string;
  userId: string;
  name: string;
  documentType: UserDocumentType;
  documentUrl: string;
  status: UserDocumentStatus;
  observation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getUserDocuments = async (
  user: BrickleUser
): Promise<UserDocumentDto[]> => {
  try {
    const response = await brickleClient.get<UserDocumentDto[]>(
      `/api/User/${user.id}/documents`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: user.email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data ?? [];
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
};

export const uploadUserDocument = async (
  user: BrickleUser,
  image: ImagePicker.ImagePickerAsset,
  documentType: UserDocumentType
) => {
  try {
    const formData = new FormData();
    formData.append("UserId", user.id);
    formData.append("Name", USER_DOCUMENT_TYPE_LABELS[documentType]);
    formData.append("DocumentType", documentType);
    formData.append(
      "File",
      sanitizeUploadImage(image, `User.${documentType}`) as any
    );

    const response = await brickleClient.post<{ documentUrl: string }>(
      `/api/User/documents`,
      formData,
      {
        headers: {
          correlationId: uuid.v4(),
          user: user.email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    const documentUrl =
      response.data?.documentUrl ??
      (response.data as { fileUrl?: string })?.fileUrl;

    if (!documentUrl || typeof documentUrl !== "string") {
      throw new Error("La API no devolvió la URL del documento");
    }

    return documentUrl;
  } catch (error) {
    console.error("Error uploading user document:", error);
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error al subir el documento";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    }
    throw error instanceof Error
      ? error
      : new Error("Error desconocido al subir el documento");
  }
};

export const getDiscoverAssets = async (
  email: string,
  active: boolean = true,
  category?: string | string[],
  limit: number = 15
) => {
  const categories = Array.isArray(category) ? category.join(",") : category;
  try {
    const response = await brickleClient.get<{
      data: Asset[];
    }>(
      `/api/Leasing/filter?categories=${categories}&page=1&limit=${limit}&active=${active}`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (__DEV__) console.log(error.response?.status);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const searchUser = async (
  userId: string,
  email: string,
  search: string
) => {
  try {
    const response = await brickleClient.get<Contact[]>(
      `/api/User/search?searchTerm=${search}&excludeUserId=${userId}`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching user:", error);
    throw new Error("Error searching user");
  }
};

export const createContact = async (
  userId: string,
  contactId: string,
  email: string
) => {
  try {
    const response = await brickleClient.post<{ data: { id: string } }>(
      `/api/User/${userId}/contacts`,
      { contactId },
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );
    return response.data.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (__DEV__) console.log(error.response?.status);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const getUserContacts = async (userId: string, email: string) => {
  try {
    const response = await brickleClient.get<Contact[]>(
      `/api/User/${userId}/contacts`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (__DEV__) console.log(error.response?.status);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const commitFunds = async (
  assetId: string,
  email: string,
  commitFundsDto: CommitFunds
) => {
  try {
    const response = await brickleClient.post<boolean>(
      `/api/Campaign/${assetId}/commitFunds`,
      commitFundsDto,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Non-axios error:", error);
    return false;
  }
};

export const getPortfolioByUserId = async (
  userId: string,
  from: string,
  to: string,
  email: string,
  projectionMonths?: number,
  expectedAnnualReturn?: number
) => {
  try {
    const extraParams = new URLSearchParams();
    if (typeof projectionMonths === "number" && !Number.isNaN(projectionMonths)) {
      extraParams.append("projectionMonths", String(projectionMonths));
    }
    if (
      typeof expectedAnnualReturn === "number" &&
      !Number.isNaN(expectedAnnualReturn)
    ) {
      extraParams.append("expectedAnnualReturn", String(expectedAnnualReturn));
    }
    const extraQuery = extraParams.toString();
    const response = await brickleClient.get<PortfolioChartDto>(
      `/api/Portfolio/overview?userId=${userId}&from=${from}&to=${to}${extraQuery ? `&${extraQuery}` : ""}`,
      {
        timeout: 30000,
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const getPortfolioProjectionByUserId = async (
  userId: string,
  startDate: string,
  currentValue: number,
  email: string,
  projectionMonths?: number,
  expectedAnnualReturn?: number,
  investedPrincipal?: number
) => {
  try {
    const principalQs =
      investedPrincipal !== undefined && investedPrincipal > 0
        ? `&investedPrincipal=${encodeURIComponent(String(investedPrincipal))}`
        : "";
    const response = await brickleClient.get<ProjectionPointDto[]>(
      `/api/Portfolio/projections?userId=${userId}&currentValue=${currentValue}&projectionMonths=${projectionMonths}&expectedAnnualReturn=${expectedAnnualReturn}&startDate=${startDate}${principalQs}`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

export const claimRent = async (
  userId: string,
  leasingId: string,
  email: string,
  claimRentBody: ClaimRent
): Promise<boolean> => {
  try {
    const response = await brickleClient.post<boolean>(
      `/api/Investment/claim-rent/${userId}/${leasingId}`,
      claimRentBody,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );
    return response.data === true;
  } catch (error) {
    console.error("Error claiming rent:", error);
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error al reclamar renta";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    }
    throw error;
  }
};

export const getAmortization = async (
  leasingId: string,
  email: string
): Promise<AmortizationTable> => {
  try {
    const response = await brickleClient.get<AmortizationTable>(
      `/api/Leasing/${leasingId}/amortization`,
      {
        headers: {
          correlationId: uuid.v4(),
          user: email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown Brickle API error";
      throw new Error(`Brickle API Error: ${errorMessage}`);
    } else {
      console.error("Non-axios error:", error);
      throw error;
    }
  }
};

/**
 * Avisa al backend para que envíe push al destinatario (usuario Brickle) tras un envío on-chain exitoso.
 * No lanza: fallos de red o API no deben afectar el flujo de la transferencia ya confirmada.
 */
export async function notifyIncomingTransferToPeer(params: {
  senderEmail: string;
  recipientWalletAddress: string;
  amount: string;
  transactionHash?: string;
}): Promise<void> {
  try {
    await brickleClient.post(
      "/api/Notifications/NotifyIncomingTransfer",
      {
        recipientWalletAddress: params.recipientWalletAddress,
        amount: params.amount,
        ...(params.transactionHash
          ? { transactionHash: params.transactionHash }
          : {}),
      },
      {
        headers: {
          correlationId: uuid.v4() as string,
          user: params.senderEmail,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("notifyIncomingTransferToPeer:", error);
  }
}

export async function checkAppVersion(): Promise<AppVersionInfo | null> {
  try {
    const response = await brickleClient.get<AppVersionInfo>(
      APP_VERSION_CHECK_URL,
    );
    return response.data;
  } catch (error) {
    console.error("checkAppVersion:", error);
    return null;
  }
}
