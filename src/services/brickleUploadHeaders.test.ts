import {
  buildMultipartUploadHeaders,
  isFormDataPayload,
} from "./brickleUploadHeaders";

describe("buildMultipartUploadHeaders", () => {
  it("uses multipart form data for file uploads", () => {
    expect(buildMultipartUploadHeaders()).toMatchObject({
      "Content-Type": "multipart/form-data",
    });
  });
});

describe("isFormDataPayload", () => {
  it("detects React Native FormData payloads", () => {
    expect(isFormDataPayload(new FormData())).toBe(true);
  });

  it("does not detect plain JSON objects as FormData", () => {
    expect(isFormDataPayload({ name: "Identity Document" })).toBe(false);
  });
});
