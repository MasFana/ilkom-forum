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
    // Don't clear on transient errors; keep existing session cookie
  }

  const res = isPublic || pb.authStore.isValid
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", req.url));

  // set updated cookie back with hardened defaults
  const isHttps = req.nextUrl.protocol === "https:";
  // Use httpOnly: false so the client can refresh the cookie after OAuth/login
  // Secure only when using HTTPS; on local dev (http) secure cookies won't be stored by the browser
  res.headers.set(
    "set-cookie",
    pb.authStore.exportToCookie({ path: "/", sameSite: "Lax", secure: isHttps, httpOnly: false, maxAge: 60 * 60 * 24 * 30 }, COOKIE_KEY)
  );
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
