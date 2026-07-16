import { fillRandomValues } from "./crypto-get-random-values";

describe("fillRandomValues", () => {
  it("fills a typed array with bytes from the provided random source", () => {
    const values = new Uint8Array(4);

    const result = fillRandomValues(values, () => new Uint8Array([1, 2, 3, 4]));

    expect(result).toBe(values);
    expect(Array.from(values)).toEqual([1, 2, 3, 4]);
  });

  it("fills typed array views without overwriting bytes outside the view", () => {
    const values = new Uint8Array([9, 9, 9, 9]);
    const view = new Uint8Array(values.buffer, 1, 2);

    fillRandomValues(view, () => new Uint8Array([5, 6]));

    expect(Array.from(values)).toEqual([9, 5, 6, 9]);
  });
});
