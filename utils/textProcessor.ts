import { WordData } from "../types";

/**
 * Calculates the Optimal Focal Point (OFP) index for a word.
 * This is usually roughly at the 1/3 to 1/4 mark of the word.
 */
export const calculateFocalIndex = (word: string): number => {
  const length = word.length;
  if (length <= 1) return 0;
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 9) return 3;
  return 4;
};

// The standard WPM convention treats a "word" as 5 characters, so 5 is used
// as the neutral point: words at this length get a 1x multiplier, and the
// nominal WPM is the average across a text whose word lengths center on it.
const AVERAGE_WORD_LENGTH = 5;
const MIN_LENGTH_MULTIPLIER = 0.7;
const MAX_LENGTH_MULTIPLIER = 1.5;
const LENGTH_VARIABILITY_STRENGTH = 0.08;

/**
 * Calculates a display-duration multiplier based on word length, so shorter
 * words flash faster and longer words linger, while keeping the multiplier
 * centered on 1 (neutral) at the conventional 5-character "average" word.
 */
export const calculateLengthMultiplier = (word: string): number => {
  const strippedLength = word.replace(/[^\p{L}\p{N}]/gu, "").length;
  const length = strippedLength || word.length;
  const multiplier = 1 + (length - AVERAGE_WORD_LENGTH) * LENGTH_VARIABILITY_STRENGTH;

  return Math.min(MAX_LENGTH_MULTIPLIER, Math.max(MIN_LENGTH_MULTIPLIER, multiplier));
};

export const processText = (text: string): WordData[] => {
  if (!text) return [];

  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/);

  return words.map((word) => {
    let pauseMultiplier = 1;
    if (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
      pauseMultiplier = 2;
    } else if (word.endsWith(",") || word.endsWith(";") || word.endsWith(":")) {
      pauseMultiplier = 1.5;
    }

    return {
      text: word,
      focalIndex: calculateFocalIndex(word),
      pauseMultiplier,
      lengthMultiplier: calculateLengthMultiplier(word),
    };
  });
};

/**
 * Formats a word into three parts: pre-focal, focal, and post-focal.
 */
export const splitWord = (word: WordData) => {
  const text = word.text;
  const idx = word.focalIndex;

  return {
    prefix: text.substring(0, idx),
    focal: text[idx] || "",
    suffix: text.substring(idx + 1),
  };
};
