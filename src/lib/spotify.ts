// Convert an open.spotify.com URL into an embed URL.
// Supports track / album / playlist / episode / show.
const KINDS = new Set(["track", "album", "playlist", "episode", "show"]);

export function spotifyEmbedUrl(input?: string | null): string | null {
  if (!input) return null;
  try {
    const url = new URL(input.trim());
    if (!/(^|\.)spotify\.com$/.test(url.hostname)) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    // Strip locale prefix like /intl-en/
    const start = parts[0]?.startsWith("intl-") ? 1 : 0;
    const kind = parts[start];
    const id = parts[start + 1];
    if (!kind || !id || !KINDS.has(kind)) return null;
    return `https://open.spotify.com/embed/${kind}/${id.split("?")[0]}`;
  } catch {
    return null;
  }
}

export function isValidSpotifyUrl(input: string): boolean {
  return spotifyEmbedUrl(input) !== null;
}
