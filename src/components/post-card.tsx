"use client";
import Link from "next/link";
import { memo } from "react";
import type { PostRecord, UserRecord } from "../lib/pocketbase";
import { Avatar } from "./ui";
import { MessageSquare } from "lucide-react";
import { timeAgo } from "../lib/utils";

export type PostWithAuthor = PostRecord & { expand?: { user?: UserRecord } };

type PostCardProps = {
  post: PostWithAuthor;
  commentCount?: number;
};

function PostCardInner({ post, commentCount = 0 }: PostCardProps) {
  const author = post.expand?.user as UserRecord | undefined;

  return (
    <article className="py-3 sm:py-4">
      <Link href={`/forum/${post.id}`} className="block rounded-xl px-3 sm:px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label={`Buka post ${post.title}`}>
        <div>
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Avatar alt={author?.username} className="h-5 w-5" />
            <span className="font-medium truncate max-w-[40%]">{author?.username || "anonim"}</span>
            <span>•</span>
            <span>{timeAgo(post.created)}</span>
          </div>
          <h2 className="text-base font-semibold mt-2 line-clamp-2">{post.title}</h2>
        </div>
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="pratinjau" className="mt-2 w-full max-h-96 object-cover rounded-lg" loading="lazy" />
        ) : null}
        {post.content ? (
          <p className="mt-2 text-sm opacity-80 line-clamp-3">{post.content}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-xs opacity-70">
          <div className="inline-flex items-center gap-1" aria-label="Jumlah komentar">
            <MessageSquare className="h-4 w-4" />{Number(commentCount || 0).toLocaleString("id-ID")}
          </div>
        </div>
      </Link>
    </article>
  );
}

export const PostCard = memo(PostCardInner);

export default PostCard;


