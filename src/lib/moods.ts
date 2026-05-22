export type Mood =
  | "lonely" | "tired" | "healing" | "grateful"
  | "anxious" | "hopeful" | "happy" | "overthinking";

export const MOODS: { key: Mood; label: string; emoji: string; color: string }[] = [
  { key: "happy",        label: "happy",        emoji: "🌼", color: "oklch(0.9 0.1 90)" },
  { key: "grateful",     label: "grateful",     emoji: "🤍", color: "oklch(0.92 0.04 100)" },
  { key: "hopeful",      label: "hopeful",      emoji: "🌱", color: "oklch(0.88 0.08 150)" },
  { key: "healing",      label: "healing",      emoji: "🪞", color: "oklch(0.88 0.05 200)" },
  { key: "lonely",       label: "lonely",       emoji: "🌙", color: "oklch(0.85 0.04 260)" },
  { key: "tired",        label: "tired",        emoji: "☁️", color: "oklch(0.88 0.02 80)" },
  { key: "anxious",      label: "anxious",      emoji: "🫧", color: "oklch(0.88 0.05 30)" },
  { key: "overthinking", label: "overthinking", emoji: "🧵", color: "oklch(0.85 0.05 320)" },
];

export const MOOD_BY_KEY: Record<Mood, (typeof MOODS)[number]> =
  Object.fromEntries(MOODS.map((m) => [m.key, m])) as never;

export const REACTIONS = [
  { key: "relate",  label: "I relate",        emoji: "🤍" },
  { key: "strong",  label: "Stay strong",     emoji: "🌿" },
  { key: "support", label: "Sending support", emoji: "🕯" },
] as const;
export type ReactionKind = (typeof REACTIONS)[number]["key"];
