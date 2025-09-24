"use client";
import PocketBase, { type RecordModel } from "pocketbase";
import { COOKIE_KEY, PB_URL } from "./config";

// Client-side singleton
let pbClient: PocketBase | null = null;

export function getPB(): PocketBase {
  if (typeof window === "undefined") {
    // On server you'll want to instantiate a new one per request in route handlers
    return new PocketBase(PB_URL);
  }
  if (!pbClient) {
    pbClient = new PocketBase(PB_URL);
    // hydrate from cookie if present
    try {
      pbClient.authStore.loadFromCookie(document.cookie, COOKIE_KEY);
    } catch { }
    pbClient.authStore.onChange(() => {
      saveAuthCookie(pbClient!);
    });
  }
  return pbClient;
}

export function saveAuthCookie(pb: PocketBase) {
  // expose cookie to browser (httpOnly false)
  const isHttps = typeof window !== "undefined" ? window.location.protocol === "https:" : true;
  const cookie = pb.authStore.exportToCookie({ httpOnly: false, path: "/", sameSite: "Lax", secure: isHttps }, COOKIE_KEY);
  if (typeof document !== "undefined") {
    document.cookie = cookie;
  }
}

export async function refreshAuthIfNeeded(pb: PocketBase) {
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
      saveAuthCookie(pb);
    }
  } catch {
    pb.authStore.clear();
    saveAuthCookie(pb);
  }
}

export type UserRecord = RecordModel & {
  username?: string;
  avatar?: string;
  email?: string;
};

export type PostRecord = RecordModel & {
  user: string;
  title: string;
  content?: string;
  image_url?: string;
  created: string;
  updated?: string;
};

export type CommentRecord = RecordModel & {
  post: string;
  user: string;
  content: string;
  image_url?: string;
  created: string;
};

export type PostListItem = {
  post: PostRecord & { expand?: { user?: UserRecord } };
  count: number;
};