import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: "post-images" | "post-backgrounds" | "avatars";
  label?: string;
  aspect?: "square" | "wide";
}

export function ImageUploader({ value, onChange, bucket, label = "Add image", aspect = "wide" }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File) => {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8MB"); return; }
    setUploading(true);
    try {
      const url = await uploadImage(bucket, file, user.id);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }}
      />
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-border">
          <img
            src={value}
            alt=""
            className={aspect === "square" ? "h-32 w-full object-cover" : "h-24 w-full object-cover"}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-soft hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-paper/60 text-sm text-ink-muted transition hover:border-clay hover:text-foreground"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Uploading…" : label}
        </button>
      )}
    </div>
  );
}
