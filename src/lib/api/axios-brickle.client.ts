import axios from "axios";
import { authStore } from "@/src/store/auth.store";
import { isFormDataPayload } from "@/src/services/brickleUploadHeaders";

export const brickleClient = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_BRICKLE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

brickleClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (isFormDataPayload(config.data)) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

brickleClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message?.includes("Network request failed")) {
      console.warn("Network error — backend may be unavailable:", error.message);
    }
    return Promise.reject(error);
  }
);
