import { rampifyClient } from "@/src/lib/api/axios-rampify.client";
import { isAxiosError } from "axios";
import {
  RampifyAssetPurchase,
  RampifyCustomer,
  RampifyKYC,
  RampifyQuote,
  User,
} from "@/src/interfaces/rampify.interface";
import { SubmitKycDataResponse } from "../types/kyc.types";

export class RampifyService {
  constructor() {
    // Validate required environment variables
    if (!process.env.EXPO_PUBLIC_RAMPIFY_API_URL) {
      console.error("EXPO_PUBLIC_RAMPIFY_API_URL is not configured");
    }
  }

  async createCustomer(user: User): Promise<RampifyCustomer> {
    try {
      const customerData = {
        email: user.email,
        phoneNumber: `+57${user.phone}`,
        type: "INDIVIDUAL",
      };

      const response = await rampifyClient.post<RampifyCustomer>(
        "/ramp/customers",
        customerData
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }

  async submitKycForReview(idCustomer: string, submissionId: string) {
    try {
      const response = await rampifyClient.post<{ message: string }>(
        `/ramp/customers/${idCustomer}/kyc/${submissionId}/submit`
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }
  async submitKYC(
    customerId: string,
    kycData: RampifyKYC
  ): Promise<SubmitKycDataResponse> {
    try {
      const response = await rampifyClient.post<SubmitKycDataResponse>(
        `/ramp/customers/${customerId}/kyc`,
        kycData
      );

      return response.data;
    } catch (error) {
      // Parse the error and extract field-specific validation errors if they exist
      if (isAxiosError(error)) {
        try {
          const errorResponse = error.response?.data;

          if (errorResponse && typeof errorResponse === "object") {
            // Extract error code, message and metadata if available
            const errorCode = errorResponse.errorCode;
            const errorMessage =
              errorResponse.errorMessage || "Error en la validación KYC";
            const errorMetadata = errorResponse.errorMetadata;

            // Create a more specific error with structured data
            const enhancedError = new Error(errorMessage);
            (
              enhancedError as unknown as {
                code: string;
                fields: string[];
                isKycValidationError: boolean;
              }
            ).code = errorCode;
            (enhancedError as unknown as { fields: string[] }).fields =
              errorMetadata?.fields || [];
            (
              enhancedError as unknown as { isKycValidationError: boolean }
            ).isKycValidationError = true;

            throw enhancedError;
          }
        } catch (parseError) {
          // If we can't parse the error properly, throw the original error
          console.error("Error parsing KYC validation error:", parseError);
        }
      }

      // If we couldn't extract specific error details, rethrow the original error
      throw error;
    }
  }

  async createQuote({
    userId,
    type,
    amount,
    fiat,
    crypto,
    payment,
    chain = "ETH",
  }: {
    userId: string;
    type: "onramp" | "offramp";
    amount: number;
    fiat: string;
    crypto: string;
    payment: string;
    chain: string;
  }): Promise<RampifyQuote> {
    try {
      const response = await rampifyClient.post<RampifyQuote>("/ramp/quote", {
        userId,
        type,
        amount,
        fiat,
        crypto,
        payment,
        chain,
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }

  async buyAsset({
    quoteId,
    fromCurrency,
    toCurrency,
    amount,
    chain,
    paymentMethodType,
    depositAddress,
    customerId,
    successUrl,
    cancelUrl,
    idempotencyKey,
  }: {
    quoteId: string;
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    chain: string;
    paymentMethodType: string;
    depositAddress: string;
    customerId: string;
    successUrl: string;
    cancelUrl: string;
    idempotencyKey: string;
  }): Promise<RampifyAssetPurchase> {
    try {
      const response = await rampifyClient.post<RampifyAssetPurchase>(
        "/ramp/buy",
        {
          quoteId,
          fromCurrency,
          toCurrency,
          amount,
          chain,
          paymentMethodType,
          depositAddress,
          customerId,
          successUrl,
          cancelUrl,
          idempotencyKey,
        }
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }

  async sellAsset({
    quoteId,
    customerId,
    amount,
    fromCurrency,
    toCurrency,
    partnerAccountId,
    fiatAccountId,
    chain,
  }: {
    quoteId: string;
    customerId: string;
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    partnerAccountId: string;
    fiatAccountId: string;
    chain: string;
  }): Promise<RampifyAssetPurchase> {
    try {
      const response = await rampifyClient.post<RampifyAssetPurchase>(
        "/ramp/sell",
        {
          quoteId,
          customerId,
          amount,
          fromCurrency,
          toCurrency,
          partnerAccountId,
          fiatAccountId,
          chain,
        }
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }

  async getKycWidgetUrl(
    customerId: string,
    redirectPath?: string
  ): Promise<string> {
    try {
      // Crear URI de redirección que funcione tanto en desarrollo como en producción

      const responseAuthToken = await rampifyClient.post<{ authToken: string }>(
        `/ramp/customers/${customerId}/auth-token`,
        { customerId }
      );

      const responseKycUrl = await rampifyClient.post<{ kycUrl: string }>(
        `/ramp/customers/${customerId}/kyc/widgetUrl`,
        {
          SuccessUrl: `https://brickle-web-app.vercel.app/redirect-brickle-mobile?success=true&page=kyc-success`,
          CancelUrl: `https://brickle-web-app.vercel.app/redirect-brickle-mobile?success=false&page=kyc-failed`,
        }
      );

      return `${responseKycUrl.data?.kycUrl}&ucToken=${responseAuthToken.data?.authToken}`;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch from Rampify API";
        throw new Error(errorMessage);
      } else {
        console.error("Non-axios error:", error);
        throw error;
      }
    }
  }
}
