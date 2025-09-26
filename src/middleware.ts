import { NextResponse, type NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { COOKIE_KEY, PB_URL } from "./lib/config";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico", "/public", "/api" /* allow apis */];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const pb = new PocketBase(PB_URL);
  pb.authStore.loadFromCookie(req.headers.get("cookie") || "", COOKIE_KEY);

  let invalidAuth = false;
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
    }
  } catch {
    // If token is invalid/expired, mark as invalid and clear
    // PocketBase throws ClientResponseError with status 401/403 for invalid auth
    invalidAuth = true;
    pb.authStore.clear();
  }

  // If the user hits /login while already authenticated, send them home
  if (pathname === "/login" && pb.authStore.isValid && !invalidAuth) {
    const res = NextResponse.redirect(new URL("/", req.url));
    const isHttps = req.nextUrl.protocol === "https:";
    res.headers.set(
      "set-cookie",
      pb.authStore.exportToCookie({ path: "/", sameSite: "Lax", secure: isHttps, httpOnly: false, maxAge: 60 * 60 * 24 * 30 }, COOKIE_KEY)
    );
    return res;
  }

  const res = (isPublic || (pb.authStore.isValid && !invalidAuth))
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
