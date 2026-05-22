export type StickerCategory = "cottagecore" | "stationery" | "celestial";

export interface StickerDef {
  key: string;
  emoji: string;
  label: string;
  category: StickerCategory;
}

export const STICKERS: StickerDef[] = [
  // Cottagecore
  { key: "flower-1", emoji: "🌷", label: "Tulip", category: "cottagecore" },
  { key: "flower-2", emoji: "🌼", label: "Daisy", category: "cottagecore" },
  { key: "flower-3", emoji: "🌸", label: "Blossom", category: "cottagecore" },
  { key: "flower-4", emoji: "🌹", label: "Rose", category: "cottagecore" },
  { key: "leaf-1", emoji: "🍃", label: "Leaf", category: "cottagecore" },
  { key: "leaf-2", emoji: "🌿", label: "Herb", category: "cottagecore" },
  { key: "mushroom", emoji: "🍄", label: "Mushroom", category: "cottagecore" },
  { key: "butterfly", emoji: "🦋", label: "Butterfly", category: "cottagecore" },
  { key: "bee", emoji: "🐝", label: "Bee", category: "cottagecore" },
  { key: "strawberry", emoji: "🍓", label: "Strawberry", category: "cottagecore" },

  // Stationery
  { key: "heart", emoji: "💗", label: "Heart", category: "stationery" },
  { key: "ribbon", emoji: "🎀", label: "Ribbon", category: "stationery" },
  { key: "envelope", emoji: "✉️", label: "Letter", category: "stationery" },
  { key: "pencil", emoji: "✏️", label: "Pencil", category: "stationery" },
  { key: "pin", emoji: "📌", label: "Pin", category: "stationery" },
  { key: "bookmark", emoji: "🔖", label: "Bookmark", category: "stationery" },
  { key: "tea", emoji: "🍵", label: "Tea", category: "stationery" },
  { key: "coffee", emoji: "☕", label: "Coffee", category: "stationery" },
  { key: "book", emoji: "📖", label: "Book", category: "stationery" },
  { key: "candle", emoji: "🕯️", label: "Candle", category: "stationery" },

  // Celestial
  { key: "star", emoji: "✨", label: "Sparkle", category: "celestial" },
  { key: "moon", emoji: "🌙", label: "Moon", category: "celestial" },
  { key: "sun", emoji: "☀️", label: "Sun", category: "celestial" },
  { key: "cloud", emoji: "☁️", label: "Cloud", category: "celestial" },
  { key: "rainbow", emoji: "🌈", label: "Rainbow", category: "celestial" },
  { key: "star2", emoji: "⭐", label: "Star", category: "celestial" },
  { key: "comet", emoji: "☄️", label: "Comet", category: "celestial" },
  { key: "crystal", emoji: "🔮", label: "Crystal", category: "celestial" },
  { key: "sparkles", emoji: "💫", label: "Dizzy", category: "celestial" },
  { key: "fire", emoji: "🔥", label: "Flame", category: "celestial" },
];

export const STICKER_BY_KEY = Object.fromEntries(STICKERS.map((s) => [s.key, s])) as Record<string, StickerDef>;

export const CATEGORIES: { key: StickerCategory; label: string }[] = [
  { key: "cottagecore", label: "Cottagecore" },
  { key: "stationery", label: "Stationery" },
  { key: "celestial", label: "Celestial" },
];
