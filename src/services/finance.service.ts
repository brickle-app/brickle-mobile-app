import { brickleClient } from "../lib/api/axios-brickle.client";
import {
  CreateRechargeDto,
  RechargeResponseDto,
  WithdrawResponseDto,
} from "../types/finance.types";
import uuid from "react-native-uuid";
import { BRICKLE_SOURCE } from "../utils/constants";

export const rechargeAccount = async (
  email: string,
  createRechargeDto: CreateRechargeDto
) => {
  try {
    const response = await brickleClient.post<RechargeResponseDto>(
      `/api/User/recharge`,
      createRechargeDto,
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
    console.log(error);
  }
};

export const withdrawAccount = async (
  email: string,
  createWithdrawDto: CreateRechargeDto
) => {
  try {
    const response = await brickleClient.post<WithdrawResponseDto>(
      `/api/User/withdraw`,
      createWithdrawDto,
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
    console.log(error);
  }
};
