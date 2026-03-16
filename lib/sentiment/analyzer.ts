// lib/analyzer.ts

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

const KEYWORDS: Record<Exclude<Emotion, 'neutral'>, string[]> = {
  happy: [
    'happy', 'joy', 'great', 'awesome', 'love', 'amazing', 'excited', 'haha', 'lol', 'nice', 'thanks', 'yay',
    'fun', 'cool', 'wonderful', 'perfect', 'brilliant', 'excellent', 'glad', 'mwhii'
  ],
  sad: [
    'sad', 'cry', 'unhappy', 'depressed', 'lonely', 'miss', 'lost', 'hiks', 'huu',
    'disappointed', 'regret', 'heartbroken', 'grief', 'miserable', 'unfortunate'
  ],
  angry: [
    'angry', 'furious', 'hate', 'rage', 'mad', 'annoyed', 'worst', 'hiss',
    'irritated', 'frustrated', 'terrible', 'awful'
  ],
  surprised: [
    'wow', 'omg', 'whoa', 'shocking', 'unbelievable', 'incredible', 'really',
    'serious', 'insane', 'unexpected', 'no way', 'kidding'
  ]
};

export function analyzeEmotion(text: string): Emotion {
  const lower = text.toLowerCase();
  let dominant: Emotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, keywords] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > maxScore) {
      maxScore = score;
      dominant = emotion as Emotion;
    }
  }

  return dominant;
}