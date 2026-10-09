import {
  applyWordsAt,
  emptySeedWords,
  isSeedPhraseComplete,
  isValidSeedWord,
  joinSeedWords,
  splitSeedWords,
} from "./seedPhrase";

describe("seedPhrase helpers", () => {
  it("splits text ignoring extra spaces, line breaks and casing", () => {
    expect(splitSeedWords("  Abandon   ABILITY\nable ")).toEqual(["abandon", "ability", "able"]);
    expect(splitSeedWords("   ")).toEqual([]);
  });

  it("validates words against the BIP39 english wordlist", () => {
    expect(isValidSeedWord("abandon")).toBe(true);
    expect(isValidSeedWord("zzzz")).toBe(false);
    expect(isValidSeedWord("")).toBe(false);
  });

  it("distributes pasted words starting at the focused cell", () => {
    const { words, nextIndex } = applyWordsAt(emptySeedWords(), 3, ["abandon", "ability"]);
    expect(words[3]).toBe("abandon");
    expect(words[4]).toBe("ability");
    expect(nextIndex).toBe(5);
  });

  it("clamps words that overflow the phrase length", () => {
    const { words, nextIndex } = applyWordsAt(emptySeedWords(), 10, ["abandon", "ability", "able", "about"]);
    expect(words).toHaveLength(12);
    expect(words[11]).toBe("ability");
    expect(nextIndex).toBe(11);
  });

  it("is complete only with 12 valid words", () => {
    const valid = Array.from({ length: 12 }, () => "abandon");
    expect(isSeedPhraseComplete(valid)).toBe(true);
    expect(isSeedPhraseComplete([...valid.slice(0, 11), "nope"])).toBe(false);
    expect(isSeedPhraseComplete(valid.slice(0, 11))).toBe(false);
  });

  it("joins words with single spaces", () => {
    expect(joinSeedWords(["abandon", " ability ", "", "able"])).toBe("abandon ability able");
  });
});
