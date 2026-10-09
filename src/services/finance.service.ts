import { brickleClient } from "../lib/api/axios-brickle.client";
import {
  CreateRechargeDto,
  RechargeResponseDto,
  WithdrawResponseDto,
} from "../types/finance.types";

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
          user: email,
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
          user: email,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};
