import axios from "axios";

export const rampifyClient = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_RAMPIFY_API_URL}`,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.EXPO_PUBLIC_RAMPIFY_API_KEY,
    "X-Api-Secret": process.env.EXPO_PUBLIC_RAMPIFY_API_SECRET,
    "x-device-id": process.env.EXPO_PUBLIC_RAMPIFY_DEVICE_ID,
  },
});

// Interceptor para debuggear las peticiones sin exponer credenciales/PII en producción
rampifyClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log("🚀 Rampify Request:", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
      });
    }
    return config;
  },
  (error) => {
    console.error("❌ Rampify Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para debuggear las respuestas
rampifyClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("✅ Rampify Response:", {
        status: response.status,
        statusText: response.statusText,
      });
    }
    return response;
  },
  (error) => {
    console.error("❌ Rampify Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
