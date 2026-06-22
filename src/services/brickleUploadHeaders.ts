export function buildMultipartUploadHeaders() {
  return {
    "Content-Type": "multipart/form-data",
  };
}

export function isFormDataPayload(data: unknown): data is FormData {
  return typeof FormData !== "undefined" && data instanceof FormData;
}
