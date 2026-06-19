import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { BRICKLE_SOURCE } from "../utils/constants";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { BrickleUser } from "../types/user.types";

export const uploadPaymentProof = async (
  user: BrickleUser,
  image: ImagePicker.ImagePickerAsset
) => {
  console.log(
    "Name:: ",
    `Payment.Proof.${image.mimeType?.split("/")[1] || "jpg"}`
  );
  try {
    const formData = new FormData();
    formData.append("EntityId", user.id);
    formData.append("File", {
      uri: image.uri,
      name: `Payment.Receipt.${image.mimeType?.split("/")[1] || "jpg"}`,
      type: image.mimeType || "image/jpeg",
    } as any);

    const response = await brickleClient.post<{ fileUrl: string }>(
      `/api/File`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
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
