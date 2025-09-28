"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPB } from "./pocketbase";
import type { PostViewRecord } from "./pocketbase";
import { DEFAULT_PER_PAGE, DEFAULT_STALE_TIME_MS } from "./config";

export type SortMode = "latest" | "popular";

export function usePosts({
  sort,
  perPage = DEFAULT_PER_PAGE,
  search = "",
}: {
  sort: SortMode;
  perPage?: number;
  search?: string;
}) {
  return useInfiniteQuery<{ items: PostViewRecord[]; total: number; page: number }>({
    queryKey: ["posts", { sort, perPage, search }],
    initialPageParam: 1,
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: 5 * 60_000,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil((lastPage.total ?? 0) / perPage);
      const nextPage = lastPage.page + 1;
      return nextPage <= totalPages && lastPage.items.length > 0 ? nextPage : undefined;
    },
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const pb = getPB();
      // Build common filter for search
      const searchFilter = search
        ? pb.filter("title ~ {:q} || content ~ {:q}", { q: search })
        : undefined;

      if (sort === "popular") {
        // Popular: sort by totalComments desc
        const list = await pb.collection("postsView").getList<PostViewRecord>(page, perPage, {
          filter: searchFilter,
          sort: "-totalComments",
          fields: "id,title,content,image_url,created,username,totalComments",
        });

        return { items: list.items, total: list.totalItems, page };
      }

      // Latest: sort by created desc
      const list = await pb.collection("postsView").getList<PostViewRecord>(page, perPage, {
        sort: "-created",
        filter: searchFilter,
        fields: "id,title,content,image_url,created,username,totalComments",
      });

      return { items: list.items, total: list.totalItems, page };
    },
    placeholderData: (prev) => prev,
  });
}


