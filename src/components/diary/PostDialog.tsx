import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PaperPost, type PaperPostData } from "./PaperPost";
import type { ReactionKind } from "@/lib/moods";

export function PostDialog({
  post,
  open,
  onOpenChange,
  onReact,
  onBookmark,
  canDelete,
  onDelete,
}: {
  post: PaperPostData | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onReact?: (k: ReactionKind) => void;
  onBookmark?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 overflow-y-auto p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:p-8"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">Whisper</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Full diary page view</DialogPrimitive.Description>

          <div className="relative mx-auto min-h-full w-full max-w-2xl py-6 sm:py-10">
            <DialogPrimitive.Close className="sticky top-4 z-10 ml-auto mr-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-ink shadow-soft transition hover:bg-paper-warm sm:fixed sm:right-6 sm:top-6 sm:mr-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {post && (
              <div className="px-4 sm:px-0">
                <PaperPost
                  post={post}
                  interactive
                  onReact={onReact}
                  onBookmark={onBookmark}
                  canDelete={canDelete}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
