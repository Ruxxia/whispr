import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/diary/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ACCENT_COLORS = ["#8b7355", "#c44569", "#5cbdb9", "#c9a84c", "#9b72cf", "#7d9b76", "#e85d3a", "#3b6fa0"];

export interface EditableProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  accent_color: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: EditableProfile;
  onSaved: (p: EditableProfile) => void;
}

export function EditProfileDialog({ open, onOpenChange, profile, onSaved }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [accent, setAccent] = useState(profile.accent_color ?? ACCENT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const patch = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
      accent_color: accent,
    };
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    onSaved({ ...profile, ...patch });
    toast.success("Profile updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper">
        <DialogHeader>
          <DialogTitle>Edit your diary cover</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Avatar</p>
            <ImageUploader bucket="avatars" value={avatarUrl} onChange={setAvatarUrl} label="Upload avatar" aspect="square" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Display name</p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Bio</p>
            <textarea
              value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-clay"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Accent color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  className={`h-8 w-8 rounded-full border-2 transition ${accent === c ? "border-foreground scale-110" : "border-border"}`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm text-paper disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
