import { brickleClient } from "../lib/api/axios-brickle.client";
import {
  GetUserAccounts,
  UserAccount,
  UserAccountResponse,
} from "../types/user-account";

export const createBankAccount = async (
  email: string,
  bankAccount: UserAccount
) => {
  try {
    const response = await brickleClient.post<UserAccountResponse>(
      `/api/UserBankAccount`,
      bankAccount,
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

export const getBankAccountById = () => {};

export const getAllBankAccounts = async (email: string, userId: string) => {
  try {
    const response = await brickleClient.get<GetUserAccounts>(
      `/api/UserBankAccount/user/${userId}`,
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

export const deleteBankAccount = async (email: string, accountId: string) => {
  try {
    const response = await brickleClient.delete<GetUserAccounts>(
      `/api/UserBankAccount/${accountId}`,
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
