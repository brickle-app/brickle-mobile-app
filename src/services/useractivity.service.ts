import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { BRICKLE_SOURCE } from "../utils/constants";
import uuid from "react-native-uuid";
import { UserActivityLog, UserActivityLogResponse } from "../types/user.types";
import { isAxiosError } from "axios";

export const createUserActivityLog = async (
  userActivityLog: UserActivityLog,
  email: string
) => {
  try {
    const response = await brickleClient.post<string>(
      `/api/UserActivityLog`,
      JSON.stringify(userActivityLog),
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
      console.log(error.response?.data);
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

export const getUserActivityLogs = async (
  email: string,
  userId: string,
  leasingId?: string,
  daysBack: number = 30,
  status?: "SUCCESS" | "PENDING" | "FAILED",
  type?: "RECHARGE" | "INVESTMENT" | "INVESTMENT-RETURN" | "INVESTMENT-RETURN-INTEREST" | "INVESTMENT-RETURN-CAPITAL" | "WITHDRAW"
) => {
  try {
    let url = `/api/UserActivityLog/${userId}?daysBack=${daysBack}`;
    if (leasingId) url += `&leasingId=${leasingId}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;

    const response = await brickleClient.get<UserActivityLogResponse>(url, {
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
      console.log(error.response?.data);
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
