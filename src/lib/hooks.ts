"use client";
import { useQuery } from "@tanstack/react-query";
import { getPB } from "./pocketbase";
import type { CommentRecord, PostRecord, UserRecord, PostListItem } from "./pocketbase";
import { DEFAULT_PER_PAGE, DEFAULT_STALE_TIME_MS } from "./config";

export type SortMode = "latest" | "popular";

export function usePosts({
  sort,
  page,
  perPage = DEFAULT_PER_PAGE,
  search = "",
}: {
  sort: SortMode;
  page: number;
  perPage?: number;
  search?: string;
}) {
  return useQuery<{ items: PostListItem[]; total: number }>({
    queryKey: ["posts", { sort, page, perPage, search }],
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const pb = getPB();
      if (sort === "popular") {
        // Populer: tampilkan seluruh post yang dibuat 3 hari terakhir, urutkan berdasarkan jumlah komentar total
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        const recentPosts = await pb
          .collection("posts")
          .getFullList<PostRecord & { expand?: { user?: UserRecord } }>({
            filter: search
              ? pb.filter("created >= {:start} && (title ~ {:q} || content ~ {:q})", { start: threeDaysAgo, q: search })
              : pb.filter("created >= {:start}", { start: threeDaysAgo }),
            expand: "user",
            fields: "id,title,content,image_url,created,expand.user.username,expand.user.avatar,expand.user.collectionId,expand.user.id",
            batch: 200,
          });
        if (recentPosts.length === 0) {
          return { items: [], total: 0 };
        }
        const ids = recentPosts.map((p) => p.id);
        const postFilter = ids.map((id) => `post = "${id}"`).join(" || ");
        const allComments = await pb.collection("comments").getFullList<CommentRecord>({
          filter: postFilter,
          fields: "id,post",
          batch: 200,
        });
        const counts = new Map<string, number>();
        for (const c of allComments) counts.set(c.post, (counts.get(c.post) || 0) + 1);
        const sortedPosts = recentPosts.sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0));
        const startIndex = (page - 1) * perPage;
        const sliced = sortedPosts.slice(startIndex, startIndex + perPage).map((p) => ({ post: p, count: counts.get(p.id) || 0 }));
        return { items: sliced, total: recentPosts.length };
      } else {
        // Terbaru: urutkan created desc + pagination, hitung komentar seperti popular (batched per halaman)
        const list = await pb.collection("posts").getList<PostRecord & { expand?: { user?: UserRecord } }>(page, perPage, {
          sort: "-created",
          expand: "user",
          fields: "id,title,content,image_url,created,expand.user.username,expand.user.avatar,expand.user.collectionId,expand.user.id",
          filter: search ? pb.filter("title ~ {:q} || content ~ {:q}", { q: search }) : undefined,
        });

        const ids = list.items.map((p) => p.id);
        if (ids.length === 0) return { items: [], total: list.totalItems };

        const postFilter = ids.map((id) => `post = "${id}"`).join(" || ");
        const allComments = await pb.collection("comments").getFullList<CommentRecord>({
          filter: postFilter,
          fields: "id,post",
          batch: 200,
        });
        const countMap = new Map<string, number>();
        for (const c of allComments) countMap.set(c.post, (countMap.get(c.post) || 0) + 1);

        return { items: list.items.map((p) => ({ post: p, count: countMap.get(p.id) || 0 })), total: list.totalItems };
      }
    },
  });
}


