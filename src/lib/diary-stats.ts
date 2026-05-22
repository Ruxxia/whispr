import type { PaperPostData } from "@/components/diary/PaperPost";

// Compute current writing streak: count consecutive days ending today (or yesterday)
// that contain at least one page.
export function computeStreak(posts: { created_at: string }[]): number {
  if (posts.length === 0) return 0;
  const days = new Set<string>();
  for (const p of posts) {
    const d = new Date(p.created_at);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let streak = 0;
  const cursor = new Date();
  // If today is empty, start from yesterday so the streak survives a single quiet day.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function gentleBadge(streak: number, pages: number): string | null {
  if (streak >= 30) return "Lantern keeper";
  if (streak >= 14) return "Steady ink";
  if (streak >= 7) return "Weekly whisperer";
  if (pages >= 50) return "Prolific";
  if (pages >= 10) return "Finding a voice";
  return null;
}

export function exportDiaryAsPDF(opts: {
  displayName: string;
  username: string;
  posts: PaperPostData[];
}) {
  const { displayName, username, posts } = opts;
  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) return;
  const safe = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  const pagesHtml = posts
    .map((p) => {
      const date = new Date(p.created_at).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric",
      });
      return `
        <article class="page">
          <header>
            <span class="date">${safe(date)}</span>
            ${p.mood ? `<span class="mood">${safe(String(p.mood))}</span>` : ""}
          </header>
          ${p.title ? `<h2>${safe(p.title)}</h2>` : ""}
          ${p.image_url ? `<img src="${safe(p.image_url)}" alt="" />` : ""}
          <div class="content">${safe(p.content).replace(/\n/g, "<br/>")}</div>
        </article>`;
    })
    .join("");

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
    <title>${safe(displayName)} — Whispr diary</title>
    <style>
      @page { margin: 18mm; }
      body { font-family: Georgia, "Cormorant Garamond", serif; color: #2d2d2d; background: #faf8f5; }
      h1 { font-size: 36px; margin: 0 0 4px; }
      .sub { color: #8b7355; margin-bottom: 32px; }
      .page { page-break-after: always; padding: 24px 0; border-top: 1px dashed #c9b99a; }
      .page header { display: flex; justify-content: space-between; font-size: 12px; color: #8b7355; text-transform: uppercase; letter-spacing: 0.08em; }
      .page h2 { font-size: 24px; margin: 12px 0; }
      .page .content { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
      .page img { max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 6px; margin: 12px 0; }
    </style>
  </head><body>
    <h1>${safe(displayName)}</h1>
    <p class="sub">@${safe(username)} · ${posts.length} pages · exported from Whispr</p>
    ${pagesHtml}
    <script>window.addEventListener("load", () => setTimeout(() => window.print(), 300));</script>
  </body></html>`);
  w.document.close();
}
