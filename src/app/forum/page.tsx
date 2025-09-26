"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Card, Input } from "../../components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search } from "lucide-react";
import { PostCard } from "../../components/post-card";
import { usePosts, type SortMode } from "../../lib/hooks";
import type { PostRecord, UserRecord } from "../../lib/pocketbase";
import { calculateTotalPages } from "../../lib/utils";

function ForumInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const [mobileSearch, setMobileSearch] = useState(q);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const sort = (params.get("sort") as SortMode) || "latest";

  function setSort(newSort: SortMode) {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", newSort);
    router.replace(`/forum?${sp.toString()}`);
    setPage(1);
  }

  const { data, isLoading, isFetching } = usePosts({ sort, page, perPage, search: q });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = useMemo(() => calculateTotalPages(total, perPage), [total, perPage]);
  const prevDisabled = page <= 1 || isFetching;
  const nextDisabled = isFetching || page >= totalPages;

  useEffect(() => {
    setMobileSearch(q);
  }, [q]);

  // Jika page melebihi totalPages (misal setelah ganti filter), kembalikan ke halaman terakhir yang valid
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="flex flex-col min-h-screen space-y-4" aria-labelledby="forum-heading">
      <h1 id="forum-heading" className="sr-only">Forum</h1>
      <div className="flex flex-wrap items-center gap-3 justify-between px-4">
        {/* Mobile-only search to avoid duplicate with header search on desktop */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const sp = new URLSearchParams(params.toString());
            if (mobileSearch) sp.set("q", mobileSearch); else sp.delete("q");
            router.replace(`/forum?${sp.toString()}`);
            setPage(1);
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
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-28 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm opacity-70">Tidak ada postingan.</Card>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {items.map(({ post, count }) => (
              <PostCard key={post.id} post={post as PostRecord & { expand?: { user?: UserRecord } }} commentCount={count} />
            ))}
          </div>
        )}
      </div>
      {/* Pagination controls */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Button disabled={prevDisabled} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Halaman sebelumnya">Sebelumnya</Button>
        <span className="text-sm opacity-70" aria-live="polite">Halaman {page} / {totalPages}</span>
        <Button disabled={nextDisabled} onClick={() => setPage((p) => p + 1)} aria-label="Halaman berikutnya">Berikutnya</Button>
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
