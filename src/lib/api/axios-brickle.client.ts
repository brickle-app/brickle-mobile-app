import axios from "axios";
import { authStore } from "@/src/store/auth.store";

export const brickleClient = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_BRICKLE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

brickleClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
