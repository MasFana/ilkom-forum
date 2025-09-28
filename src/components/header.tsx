"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPB, saveAuthCookie, type UserRecord } from "../lib/pocketbase";
import { Avatar, Button, Dropdown, DropdownItem, Input } from "./ui";
import { LogOut, LogIn, PlusCircle, Search as SearchIcon } from "lucide-react";
import NotificationSidebar from "./notification-sidebar";

export default function Header() {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<UserRecord | null>(null);
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState("");
    const pb = getPB();
    // NotificationDropdown is a self-contained Dropdown; nothing to wire here.
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
        router.push("/login");
    }

    return (
        <div className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-neutral-950/70 border-b border-black/10 dark:border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight" aria-label="Ilkom Forum beranda">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.ico" alt="logo" className="h-8 w-8 rounded" />
                    Ilkom Forum
                </Link>
                {/* Center search (desktop) */}
                <form
                    role="search"
                    onSubmit={(e) => { e.preventDefault(); router.push(`/?q=${encodeURIComponent(query)}`); }}
                    className="hidden md:flex flex-1 pl-6 mx-4 items-center"
                >
                    <div className="relative flex-1">
                        <Input
                            aria-label="Cari"
                            placeholder="Cari di forum..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pr-10"
                        />
                        <Button
                            type="submit"
                            aria-label="Cari"
                            title="Cari"
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-xl rounded-l-none "
                        >
                            <SearchIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </form>

                <div className="ml-auto flex items-center gap-2">
                    {mounted && isAuth ? (
                        <>
                            {/* Visible text button on md+, compact icon button on small screens */}
                            <Link href="/new" className="hidden md:inline-flex"><Button className="gap-1"><PlusCircle className="h-4 w-4" />Tulis</Button></Link>
                            <Link href="/new" className="md:hidden" aria-label="Tulis Post"><Button className="px-3 py-2 rounded-lg"><PlusCircle className="h-5 w-5" /></Button></Link>
                            <NotificationSidebar />
                            <Dropdown
                                ariaLabel="Menu profil"
                                className="p-0 pt-2"
                                hideChevron={true}
                                label={<span className="inline-flex justify-center items-center gap-2 min-w-0"><Avatar alt={user?.username} /><span className="hidden md:inline text-sm opacity-80 truncate max-w-[140px]">{user?.username || "Profil"}</span></span>}
                            >
                                <DropdownItem onClick={() => router.push("/profile")}>Profil</DropdownItem>
                                <hr className="border-t opacity-20" />
                                <DropdownItem onClick={onLogout}><span className="inline-flex items-center gap-2"><LogOut className="h-4 w-4" />Keluar</span></DropdownItem>
                            </Dropdown>
                        </>
                    ) : (
                        <Link href="/login"><Button className="gap-1"><LogIn className="h-4 w-4" />Masuk</Button></Link>
                    )}
                </div>
            </div>
        </div>
    );
}
