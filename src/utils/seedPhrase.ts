import { wordlists } from "ethers";

export const SEED_PHRASE_LENGTH = 12;

const englishWordlist = wordlists.en;

/** Splits any pasted/typed text into lowercase words, ignoring extra whitespace and line breaks. */
export function splitSeedWords(text: string): string[] {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function isValidSeedWord(word: string): boolean {
  return word.length > 0 && englishWordlist.getWordIndex(word) !== -1;
}

/**
 * Writes `incoming` words into `current` starting at `startIndex`, clamped to the phrase length.
 * Returns the new words array and the index that should receive focus next.
 */
export function applyWordsAt(
  current: string[],
  startIndex: number,
  incoming: string[],
  length = SEED_PHRASE_LENGTH
): { words: string[]; nextIndex: number } {
  const words = [...current];
  incoming.forEach((word, offset) => {
    const index = startIndex + offset;
    if (index < length) words[index] = word;
  });

  return {
    words,
    nextIndex: Math.min(startIndex + incoming.length, length - 1),
  };
}

export function emptySeedWords(length = SEED_PHRASE_LENGTH): string[] {
  return Array.from({ length }, () => "");
}

export function isSeedPhraseComplete(words: string[], length = SEED_PHRASE_LENGTH): boolean {
  return words.length === length && words.every(isValidSeedWord);
}

export function joinSeedWords(words: string[]): string {
  return words.map((word) => word.trim()).filter(Boolean).join(" ");
}
