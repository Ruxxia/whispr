-- Phase 5: time-capsule + music attachments
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS spotify_url text;

CREATE INDEX IF NOT EXISTS posts_publish_at_idx ON public.posts (publish_at);

-- Tighten select policy: time-capsule posts hidden until publish_at, but always visible to author
DROP POLICY IF EXISTS "public posts are viewable by authenticated users" ON public.posts;
CREATE POLICY "public posts are viewable by authenticated users"
ON public.posts FOR SELECT
TO authenticated
USING (
  author_id = auth.uid()
  OR (
    visibility = 'public'
    AND (publish_at IS NULL OR publish_at <= now())
  )
);
