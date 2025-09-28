"use client";
import { useQuery } from "@tanstack/react-query";
import { getPB } from "./pocketbase";
import type { PostViewRecord } from "./pocketbase";
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
  return useQuery<{ items: PostViewRecord[]; total: number }>({
    queryKey: ["posts", { sort, page, perPage, search }],
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const pb = getPB();
      // Build common filter for search
      const searchFilter = search
        ? pb.filter("title ~ {:q} || content ~ {:q}", { q: search })
        : undefined;

      if (sort === "popular") {
        // Popular: use postsView, filter by last 3 days, sort by totalComments desc
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

        const list = await pb.collection("postsView").getList<PostViewRecord>(page, perPage, {
          filter: searchFilter
            ? pb.filter("created >= {:start} && ({:search})", { start: threeDaysAgo, search: searchFilter })
            : pb.filter("created >= {:start}", { start: threeDaysAgo }),
          sort: "-totalComments",
          fields: "id,title,content,image_url,created,username,totalComments",
        });

        return { items: list.items, total: list.totalItems };
      } else {
        // Latest: sort by created desc
        const list = await pb.collection("postsView").getList<PostViewRecord>(page, perPage, {
          sort: "-created",
          filter: searchFilter,
          fields: "id,title,content,image_url,created,username,totalComments",
        });

        return { items: list.items, total: list.totalItems };
      }
    }
  });
}


