import { getAssetListState } from "./discoverScreen.logic";

jest.mock("@/src/utils/categories", () => ({
  getCategory: jest.fn(() => null),
}));

describe("getAssetListState", () => {
  it("shows loading before empty for category results", () => {
    expect(getAssetListState({ loading: true, assetsCount: 0, errorMessage: null })).toBe("loading");
  });

  it("shows empty only after loading completes without results", () => {
    expect(getAssetListState({ loading: false, assetsCount: 0, errorMessage: null })).toBe("empty");
  });

  it("shows error before empty", () => {
    expect(getAssetListState({ loading: false, assetsCount: 0, errorMessage: "falló" })).toBe("error");
  });
});
