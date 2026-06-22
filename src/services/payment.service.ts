import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { BRICKLE_SOURCE } from "../utils/constants";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { sanitizeUploadImage } from "../utils/secureUpload";

export const uploadPaymentProof = async (
  user: { id: string; email: string },
  image: ImagePicker.ImagePickerAsset
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", user.id);
    formData.append("File", sanitizeUploadImage(image, "Payment.Receipt") as any);

    const response = await brickleClient.post<{ fileUrl: string }>(
      `/api/File`,
      formData,
      {
        headers: {
          correlationId: uuid.v4(),
          user: user.email,
          source: BRICKLE_SOURCE,
          RequestDate: new Date().toISOString(),
        },
      }
    );

    const fileUrl = response.data.fileUrl;

    if (!fileUrl) {
      throw new Error("File URL is null");
    }

    return fileUrl;
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw error;
  }
};
