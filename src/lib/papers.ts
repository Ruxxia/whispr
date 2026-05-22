export type PaperStyle =
  | "hvs" | "notebook" | "torn" | "vintage"
  | "dotted" | "crumpled" | "perforated" | "sticky" | "scrapbook"
  | "parchment" | "linen" | "graph";

export const PAPER_STYLES: { key: PaperStyle; label: string; className: string; defaultColor: string }[] = [
  { key: "hvs",        label: "HVS",         className: "paper-hvs",        defaultColor: "#faf8f5" },
  { key: "notebook",   label: "Notebook",    className: "paper-notebook",   defaultColor: "#fbf9f3" },
  { key: "dotted",     label: "Dotted",      className: "paper-dotted",     defaultColor: "#faf8f5" },
  { key: "vintage",    label: "Vintage",     className: "paper-vintage",    defaultColor: "#f0e6d2" },
  { key: "sticky",     label: "Sticky",      className: "paper-sticky",     defaultColor: "#fff4a3" },
  { key: "crumpled",   label: "Crumpled",    className: "paper-crumpled",   defaultColor: "#f5f0e8" },
  { key: "torn",       label: "Torn",        className: "paper-torn",       defaultColor: "#faf8f5" },
  { key: "perforated", label: "Perforated",  className: "paper-perforated", defaultColor: "#faf8f5" },
  { key: "scrapbook",  label: "Scrapbook",   className: "paper-scrapbook",  defaultColor: "#faf3e6" },
  { key: "parchment",  label: "Parchment",   className: "paper-parchment",  defaultColor: "#f4e9d2" },
  { key: "linen",      label: "Linen",       className: "paper-linen",      defaultColor: "#f5f0e6" },
  { key: "graph",      label: "Graph",       className: "paper-graph",      defaultColor: "#f8f6ef" },
];

export const PAPER_BY_KEY: Record<PaperStyle, (typeof PAPER_STYLES)[number]> =
  Object.fromEntries(PAPER_STYLES.map((p) => [p.key, p])) as never;

export const PAPER_COLORS = [
  "#faf8f5", "#f0ebe3", "#fbf9f3", "#f0e6d2", "#fff4a3",
  "#ffe5e5", "#e7f0e3", "#e3edf5", "#f3e3f0", "#e8e0d4",
];

export const FONT_OPTIONS = [
  { key: "serif", label: "Serif",      family: "var(--font-serif)" },
  { key: "sans",  label: "Sans",       family: "var(--font-sans)" },
  { key: "hand",  label: "Handwritten",family: "var(--font-hand)" },
] as const;
export type FontKey = (typeof FONT_OPTIONS)[number]["key"];
