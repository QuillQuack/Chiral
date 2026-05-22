"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [sent, setSent] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setResendError(data.error || "Failed to resend");
      } else {
        setSent(true);
      }
    } catch {
      setResendError("Network error");
    } finally {
      setResending(false);
    }
  };

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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Verify Your Email
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            We sent a verification link to{" "}
            <span className="text-accent-pink font-medium">{email || "your email"}</span>
            . Click the link to activate your account.
          </p>

          {sent ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
              Verification email sent! Check your inbox.
            </div>
          ) : (
            <>
              {resendError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                  {resendError}
                </div>
              )}
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 rounded-xl font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all disabled:opacity-50 mb-3"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </>
          )}

          <p className="text-text-secondary/50 text-xs">
            The link expires after 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
        </div>

        <p className="mt-6 text-text-secondary text-sm">
          <Link href="/login" className="text-accent-cyan hover:text-accent-pink transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
