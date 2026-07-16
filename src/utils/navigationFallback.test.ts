import { goBackOrReplace } from "./navigationFallback";

describe("goBackOrReplace", () => {
  it("goes back when navigation history exists", () => {
    const router = {
      canGoBack: jest.fn(() => true),
      back: jest.fn(),
      replace: jest.fn(),
    };

    goBackOrReplace(router, "/dashboard");

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("replaces with fallback when navigation history does not exist", () => {
    const router = {
      canGoBack: jest.fn(() => false),
      back: jest.fn(),
      replace: jest.fn(),
    };

    goBackOrReplace(router, "/dashboard");

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
