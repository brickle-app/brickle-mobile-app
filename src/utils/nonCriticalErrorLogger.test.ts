import { logNonCriticalError } from "./nonCriticalErrorLogger";

describe("logNonCriticalError", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses warn instead of error so recoverable dashboard failures do not trigger the red overlay", () => {
    const error = new Error("timeout of 30000ms exceeded");

    logNonCriticalError("Error fetching portfolio", error);

    expect(console.warn).toHaveBeenCalledWith("Error fetching portfolio", error);
    expect(console.error).not.toHaveBeenCalled();
  });
});
