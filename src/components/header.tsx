"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPB, saveAuthCookie, type UserRecord } from "../lib/pocketbase";
import { Avatar, Button, Dropdown, DropdownItem, Input } from "./ui";
import { LogOut, LogIn, PlusCircle, Menu, Search as SearchIcon } from "lucide-react";

export default function Header() {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<UserRecord | null>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState("");
    const pb = getPB();

    useEffect(() => {
        const unsub = pb.authStore.onChange((_t, r) => {
            setIsAuth(pb.authStore.isValid);
            setUser(r as UserRecord | null);
        }, true);
        setMounted(true);
        return () => unsub();
    }, [pb]);

    function onLogout() {
        pb.authStore.clear();
        saveAuthCookie(pb);
        window.location.href = "/login";
    }

    // Avatar identicon ditangani oleh komponen Avatar

    return (
        <div className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-neutral-950/70 border-b border-black/10 dark:border-white/10">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
                <button className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
                    <Menu className="h-5 w-5" />
                </button>
                <Link href="/forum" className="flex items-center gap-2 text-base font-bold tracking-tight" aria-label="Ilkom Forum beranda">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.ico" alt="logo" className="h-8 w-8 rounded" />
                    Ilkom Forum
                </Link>
                {/* Center search (desktop) */}
                <form
                    role="search"
                    onSubmit={(e) => { e.preventDefault(); window.location.href = `/forum?q=${encodeURIComponent(query)}`; }}
                    className="hidden md:flex flex-1 max-w-xl mx-4 items-center gap-2"
                >
                    <Input
                        aria-label="Cari"
                        placeholder="Cari di forum..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full"
                    />
                    <Button type="submit" aria-label="Cari" title="Cari" className="px-3 py-2">
                        <SearchIcon className="h-4 w-4" />
                    </Button>
                </form>
                <div className="ml-auto flex items-center gap-2">
                    {mounted && isAuth ? (
                        <>
                            {/* Visible text button on md+, compact icon button on small screens */}
                            <Link href="/new-post" className="hidden md:inline-flex"><Button className="gap-1"><PlusCircle className="h-4 w-4" />Tulis</Button></Link>
                            <Link href="/new-post" className="md:hidden" aria-label="Tulis Post"><Button className="px-3 py-2 rounded-lg"><PlusCircle className="h-5 w-5" /></Button></Link>
                            <Dropdown
                                ariaLabel="Menu profil"
                                label={<span className="inline-flex items-center gap-2 min-w-0"><Avatar alt={user?.username} /><span className="hidden md:inline text-sm opacity-80 truncate max-w-[140px]">{user?.username || "Profil"}</span></span>}
                            >
                                <DropdownItem onClick={() => router.push("/profile")}>Profil</DropdownItem>
                                <DropdownItem onClick={onLogout}><span className="inline-flex items-center gap-2"><LogOut className="h-4 w-4" />Keluar</span></DropdownItem>
                            </Dropdown>
                        </>
                    ) : (
                        <Link href="/login"><Button className="gap-1"><LogIn className="h-4 w-4" />Masuk</Button></Link>
                    )}
                </div>
            </div>
            {/* Mobile menu drawer */}
            {open ? (
                <div className="md:hidden border-t border-black/10 dark:border-white/10">
                    <div className="mx-auto max-w-5xl px-4 py-3 grid gap-3">
                        <Link onClick={() => setOpen(false)} href="/forum" className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Beranda</Link>
                        {mounted && isAuth ? (
                            <>
                                <Link onClick={() => setOpen(false)} href="/new-post" className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Tulis Post</Link>
                                <Link onClick={() => setOpen(false)} href="/profile" className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Profil</Link>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
