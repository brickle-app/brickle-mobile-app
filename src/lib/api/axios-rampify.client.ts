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

// Interceptor para debuggear las peticiones
rampifyClient.interceptors.request.use(
  (config) => {
    console.log("🚀 Rampify Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });
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
    console.log("✅ Rampify Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Rampify Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
