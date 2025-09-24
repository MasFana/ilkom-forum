import { NextResponse, type NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { COOKIE_KEY, PB_URL } from "./lib/config";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico", "/public", "/api" /* allow apis */];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const pb = new PocketBase(PB_URL);
  pb.authStore.loadFromCookie(req.headers.get("cookie") || "", COOKIE_KEY);

  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
    }
  } catch {
    pb.authStore.clear();
  }

  const res = isPublic || pb.authStore.isValid
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", req.url));

  // set updated cookie back with hardened defaults
  res.headers.set(
    "set-cookie",
    pb.authStore.exportToCookie({ path: "/", sameSite: "Lax", secure: true }, COOKIE_KEY)
  );
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
