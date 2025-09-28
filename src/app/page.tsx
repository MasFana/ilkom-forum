"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Input } from "../components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search } from "lucide-react";
import { PostCard } from "../components/post-card";
import { usePosts, type SortMode } from "../lib/hooks";
import type { PostRecord, PostViewRecord, UserRecord } from "../lib/pocketbase";
import { DEFAULT_PER_PAGE } from "@/lib/config";

function ForumInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const [mobileSearch, setMobileSearch] = useState(q);
  const perPage = DEFAULT_PER_PAGE;
  const sort = (params.get("sort") as SortMode) || "latest";

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function setSort(newSort: SortMode) {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", newSort);
    router.replace(`/?${sp.toString()}`);
    handleScrollTop();
  }

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts({ sort, perPage, search: q });

  const items: PostViewRecord[] = useMemo(
    () => data?.pages.flatMap((pageData) => pageData.items) ?? [],
    [data]
  );
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileSearch(q);
  }, [q]);

  useEffect(() => {
    handleScrollTop();
  }, [sort, q]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-col min-h-screen space-y-4 pt-4" aria-labelledby="forum-heading">
      <h1 id="forum-heading" className="sr-only">Forum</h1>
      <div className="flex flex-wrap items-center gap-3 justify-between px-4">
        {/* Mobile-only search to avoid duplicate with header search on desktop */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const sp = new URLSearchParams(params.toString());
            if (mobileSearch) sp.set("q", mobileSearch); else sp.delete("q");
            router.replace(`/?${sp.toString()}`);
            handleScrollTop();
          }}
          className="w-full md:hidden flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              aria-label="Cari postingan"
              placeholder="Cari postingan..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isFetching} aria-label="Cari">{<Search className="h-4 w-4 mr-1" />}Cari</Button>
        </form>

        <div className="flex items-center gap-1 rounded-xl border border-black/10 dark:border-white/10 p-0 bg-white/60 dark:bg-background/60 w-full sm:w-auto shrink-0" role="tablist" aria-label="Urutkan">
          <button
            onClick={() => setSort("latest")}
            className={`px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1 ${sort === "latest" ? "bg-black text-white dark:bg-white dark:text-black" : "opacity-80 hover:opacity-100"}`}
            role="tab"
            aria-selected={sort === "latest"}
          >
            <Clock className="h-4 w-4" /> Terbaru
          </button>
          <button
            onClick={() => setSort("popular")}
            className={`px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1 ${sort === "popular" ? "bg-black text-white dark:bg-white dark:text-black" : "opacity-80 hover:opacity-100"}`}
            role="tab"
            aria-selected={sort === "popular"}
          >
            Populer
          </button>
        </div>

      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 12 }).map((_, i) => (

              <Card key={i} className="h-28 animate-pulse bg-neutral-100 dark:bg-neutral-900" />

            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm opacity-70">Tidak ada postingan.</Card>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {items.map((item) => {
              const postData = {
                id: item.id,
                title: item.title,
                content: item.content,
                image_url: item.image_url,
                created: item.created,
                expand: { user: ({ username: item.username } as unknown) as UserRecord },
              } as unknown as PostRecord & { expand?: { user?: UserRecord } };
              return <PostCard key={item.id} post={postData} commentCount={item.totalComments} />;
            })}
          </div>
        )}
      </div>
      <div ref={loadMoreRef} className="mt-auto h-12" aria-hidden />
      <div className="flex items-center justify-center py-4 text-sm opacity-70" aria-live="polite">
        {isFetchingNextPage
          ? "Memuat lebih banyak…"
          : !hasNextPage && items.length > 0
            ? "Semua postingan telah ditampilkan."
            : null}
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Memuat…</div>}>
      <ForumInner />
    </Suspense>
  );
}
