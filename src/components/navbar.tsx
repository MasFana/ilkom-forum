"use client";
import Link from "next/link";
import { Button, Avatar } from "./ui";
import { useEffect, useState } from "react";
import { getPB, saveAuthCookie } from "../lib/pocketbase";
import type PocketBase from "pocketbase";

export default function Navbar() {
  const [pb, setPb] = useState<PocketBase | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const client = getPB();
    setPb(client);
    const unsub = client.authStore.onChange((_t, r) => {
      setIsAuth(client.authStore.isValid);
      setUsername(r?.username);
      if (r?.avatar) {
        setAvatar(client.files.getUrl(r, r.avatar));
      } else {
        setAvatar(undefined);
      }
    }, true);
    return () => unsub();
  }, []);

  // OAuth login handled on /login page for a single flow

  async function logout() {
    if (!pb) return;
    pb.authStore.clear();
    saveAuthCookie(pb);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/60 dark:bg-neutral-950/60 border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/forum" className="font-semibold">Ilkom Forum</Link>
          <nav className="hidden sm:flex items-center gap-3 text-sm" aria-label="Navigasi utama">
            <Link href="/forum" className="opacity-80 hover:opacity-100">Beranda</Link>
            <Link href="/new-post" className="opacity-80 hover:opacity-100">Tulis Post</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAuth ? (
            <>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar src={avatar} alt={username} />
                <span className="hidden sm:inline text-sm opacity-80">{username || "Profil"}</span>
              </Link>
              <Button onClick={logout}>Keluar</Button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
