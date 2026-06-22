import axios from "axios";
import { authStore } from "@/src/store/auth.store";
import { isFormDataPayload } from "@/src/services/brickleUploadHeaders";

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
  if (isFormDataPayload(config.data)) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});
