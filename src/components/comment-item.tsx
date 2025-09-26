"use client";
import { memo } from "react";
import type { CommentRecord, UserRecord } from "../lib/pocketbase";
import { Avatar } from "./ui";
import { timeAgo } from "../lib/utils";
import { Trash2 } from "lucide-react";
import { getPB } from "../lib/pocketbase";

export type CommentWithAuthor = CommentRecord & { expand?: { user?: UserRecord } };

type CommentItemProps = {
  comment: CommentWithAuthor;
  onDeleted?: (id: string) => void;
};

function CommentItemInner({ comment, onDeleted }: CommentItemProps) {
  const author = comment.expand?.user as UserRecord | undefined;
  const pb = getPB();
  const canDelete = pb.authStore.record?.id && comment.user ? pb.authStore.record?.id === comment.user : false;

  async function handleDelete() {
    if (!canDelete) return;
    const ok = window.confirm("Hapus komentar ini?");
    if (!ok) return;
    try {
      await pb.collection("comments").delete(comment.id);
      onDeleted?.(comment.id);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className=" border-l bg-black/2 dark:bg-white/2 border-black/10 dark:border-white/10 p-3">
      <div className="flex items-start gap-3">
        <Avatar alt={author?.username} />
        <div className="flex-1 min-w-0">
          <div className="text-xs opacity-70 flex items-center gap-2">
            <span className="font-medium">{author?.username || "anonim"}</span>
            <span>•</span>
            <span>{timeAgo(comment.created)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
          {comment.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.image_url} alt="comment img" className="mt-2 rounded-xl max-h-60 object-contain" />
          ) : null}
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto my-auto px-2 py-1 rounded-lg text-xs inline-flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Hapus komentar"
            title="Hapus komentar"
          >
            <Trash2 className="h-4 w-4" /> Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const CommentItem = memo(CommentItemInner);

export default CommentItem;


