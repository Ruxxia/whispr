
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('reaction','bookmark','follow')),
  post_id uuid,
  reaction_kind text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications (recipient_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipient reads own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "recipient updates own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "recipient deletes own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = recipient_id);

-- Trigger fns
CREATE OR REPLACE FUNCTION public.tg_notify_reaction_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE author uuid;
BEGIN
  SELECT author_id INTO author FROM public.posts WHERE id = NEW.post_id;
  IF author IS NOT NULL AND author <> NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, kind, post_id, reaction_kind)
    VALUES (author, NEW.user_id, 'reaction', NEW.post_id, NEW.kind::text);
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_reaction_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE kind = 'reaction' AND actor_id = OLD.user_id
    AND post_id = OLD.post_id AND reaction_kind = OLD.kind::text;
  RETURN OLD;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_bookmark_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE author uuid;
BEGIN
  SELECT author_id INTO author FROM public.posts WHERE id = NEW.post_id;
  IF author IS NOT NULL AND author <> NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, kind, post_id)
    VALUES (author, NEW.user_id, 'bookmark', NEW.post_id);
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_bookmark_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE kind = 'bookmark' AND actor_id = OLD.user_id AND post_id = OLD.post_id;
  RETURN OLD;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_follow_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, actor_id, kind)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_notify_follow_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE kind = 'follow' AND actor_id = OLD.follower_id AND recipient_id = OLD.following_id;
  RETURN OLD;
END $$;

REVOKE EXECUTE ON FUNCTION public.tg_notify_reaction_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_reaction_delete() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_bookmark_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_bookmark_delete() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_follow_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_follow_delete() FROM anon, authenticated;

CREATE TRIGGER trg_reactions_notify_ins AFTER INSERT ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_reaction_insert();
CREATE TRIGGER trg_reactions_notify_del AFTER DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_reaction_delete();
CREATE TRIGGER trg_bookmarks_notify_ins AFTER INSERT ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_bookmark_insert();
CREATE TRIGGER trg_bookmarks_notify_del AFTER DELETE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_bookmark_delete();
CREATE TRIGGER trg_follows_notify_ins AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_follow_insert();
CREATE TRIGGER trg_follows_notify_del AFTER DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_follow_delete();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
