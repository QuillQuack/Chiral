"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type VerifyStatus = "loading" | "missing_token" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>(
    token ? "loading" : "missing_token"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);

        if (cancelled) return;

        if (res.status === 410) {
          router.replace("/verify-email/expired");
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Verification failed");
          setStatus("error");
          return;
        }

        const data = await res.json();

        if (data.alreadyVerified) {
          router.replace("/verify-email/success");
          return;
        }

        setStatus("success");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch {
        if (!cancelled) {
          setErrorMsg("Network error. Please try again.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-cyan bg-clip-text text-transparent">
              Chiral
            </span>
            <span className="text-2xl font-bold text-text-primary">Downloads</span>
          </Link>
        </div>

        <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8">
          {status === "missing_token" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Invalid Link
              </h1>
              <p className="text-text-secondary text-sm mb-6">
                No verification token provided. Check your email for the full verification link.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-xl font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all"
              >
                Back to Sign In
              </Link>
            </>
          )}

          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verifying your email...
              </h1>
              <p className="text-text-secondary text-sm">
                This should only take a second.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Email Verified!
              </h1>
              <p className="text-text-secondary text-sm">
                Redirecting you to sign in...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verification Failed
              </h1>
              <p className="text-text-secondary text-sm mb-6">
                {errorMsg}
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-xl font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
