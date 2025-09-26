"use client";
import { useEffect, Suspense } from "react";
import { Button, Card } from "../../components/ui";
import { getPB, saveAuthCookie } from "../../lib/pocketbase";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

type OAuthProvider = {
  name: string;
  codeVerifier?: string;
  authUrl?: string;
  authURL?: string;
  state?: string;
};

type ListAuthMethodsResponse = {
  oauth2?: { providers?: OAuthProvider[] };
  authProviders?: OAuthProvider[]; // legacy field name support
};

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const isCallback = !!params.get("state") && !!params.get("code");

  useEffect(() => {
    const pb = getPB();
    // Redirect immediately if session is already valid, and on any auth change
    const unsub = pb.authStore.onChange(() => {
      if (pb.authStore.isValid) {
        // persist to cookie then navigate
        saveAuthCookie(pb);
        router.push("/");
      }
    }, true);

    const code = params.get("code");
    const state = params.get("state");
    (async () => {
      try {
        if (code && state) {
          const raw = localStorage.getItem("pb_oauth2");
          if (raw) {
            const data = JSON.parse(raw) as { provider?: string; codeVerifier?: string; redirectUrl?: string; state?: string };
            if (data.state && data.state !== state) {
              throw new Error("Invalid OAuth state");
            }
            if (data.provider && data.codeVerifier) {
              await pb.collection("users").authWithOAuth2Code(
                data.provider,
                code,
                data.codeVerifier,
                data.redirectUrl || window.location.origin + "/login"
              );
              // persist updated auth to cookie for middleware/SSR
              saveAuthCookie(pb);
              localStorage.removeItem("pb_oauth2");
              // Redirect right away after successful OAuth
              router.push("/");
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      // If already logged-in (no OAuth flow), go to homepage (/)
      if (pb.authStore.isValid) window.location.replace("/");
    })();
    return () => unsub();
  }, [router, params]);

  async function continueWithGoogle() {
    const pb = getPB();
    try {
      // Manual OAuth2 start: get provider info -> store -> redirect to provider auth URL
      const methods = (await pb
        .collection("users")
        .listAuthMethods()) as unknown as ListAuthMethodsResponse;
      const providers: OAuthProvider[] = methods.oauth2?.providers ?? methods.authProviders ?? [];
      const google = providers.find((p: OAuthProvider) => p.name === "google");
      if (!google) throw new Error("Google provider not enabled in PocketBase");

      const redirectUrl = window.location.origin + "/login";
      localStorage.setItem(
        "pb_oauth2",
        JSON.stringify({ provider: google.name, codeVerifier: google.codeVerifier, redirectUrl, state: google.state })
      );
      const rawAuthUrl = google.authUrl || google.authURL; // support both casings
      if (!rawAuthUrl) throw new Error("Invalid provider auth URL");
      // As per PocketBase docs, append our redirect URL (encoded) to the provider authUrl
      // The provider URL already contains the query param key, so we only append the encoded value
      const finalUrl = rawAuthUrl + encodeURIComponent(redirectUrl);
      router.push(finalUrl);
  
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to authenticate with Google";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center" aria-labelledby="login-heading">
      <Card className="w-full max-w-sm p-4 rounded-2xl text-center">
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="logo" className=" border border-black/5 dark:border-white/5 rounded-xl mb-4" />
          {isCallback ? (
            <>
              <h1 id="login-heading" className="text-xl font-semibold mb-2">Mengautentikasi…</h1>
              <p className="text-sm opacity-70">Harap tunggu sebentar, kami sedang menyelesaikan proses masuk.</p>
            </>
          ) : (
            <>
              <h1 id="login-heading" className="text-xl font-semibold mb-2">Masuk</h1>
              <p className="text-sm opacity-70 mb-6">Masuk untuk bergabung dalam diskusi</p>
              <Button
                onClick={continueWithGoogle}
                className="w-full flex items-center justify-center gap-2 bg-white text-black border border-black/10 dark:bg-background dark:text-white dark:border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Google"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="h-5 w-5"
                />
                Lanjut dengan Google
              </Button>
              <p className="text-xs opacity-60 mt-4">Dengan melanjutkan, Anda menyetujui Ketentuan & Privasi kami.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Memuat…</div>}>
      <LoginInner />
    </Suspense>
  );
}
