import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string(),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string(),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_BRICKLE_API_URL: z.string().url(),
  EXPO_PUBLIC_POLYGON_RPC: z.string().url(),
});

export function validateEnv() {
  try {
    const env = {
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_BRICKLE_API_URL: process.env.EXPO_PUBLIC_BRICKLE_API_URL,
      EXPO_PUBLIC_POLYGON_RPC: process.env.EXPO_PUBLIC_POLYGON_RPC,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error("Environment validation failed:");
      result.error.errors.forEach((error) => {
        console.error(`- ${error.path.join(".")}: ${error.message}`);
      });
      return false;
    }

    if (!__DEV__) {
      const brickleUrl = new URL(result.data.EXPO_PUBLIC_BRICKLE_API_URL);
      if (brickleUrl.protocol !== "https:") {
        console.error("EXPO_PUBLIC_BRICKLE_API_URL must use HTTPS in production");
        return false;
      }
    }

    console.log("Environment variables validated successfully");
    return true;
  } catch (error) {
    console.error("Error validating environment:", error);
    return false;
  }
}
