import * as ImagePicker from "expo-image-picker";

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function sanitizeUploadImage(
  image: ImagePicker.ImagePickerAsset,
  basename: string
) {
  const mimeType = image.mimeType?.toLowerCase() || "image/jpeg";

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Tipo de archivo no permitido. Usa JPG, PNG o WEBP.");
  }

  if (typeof image.fileSize === "number" && image.fileSize > MAX_UPLOAD_BYTES) {
    throw new Error("El archivo supera el tamaño máximo permitido de 5 MB.");
  }

  if (!image.uri || !/^file:\/\/|^content:\/\/|^ph:\/\//.test(image.uri)) {
    throw new Error("URI de archivo no válida.");
  }

  const safeBasename = basename.replace(/[^a-z0-9._-]/gi, ".");
  const extension = MIME_EXTENSION[mimeType];

  return {
    uri: image.uri,
    name: `${safeBasename}.${extension}`,
    type: mimeType,
  };
}
