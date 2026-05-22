"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailExpiredPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error");
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Link Expired
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            That verification link has expired. Links are only valid for 1 hour.
          </p>

          {sent ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
              New verification email sent! Check your inbox.
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="w-full py-3 rounded-xl font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all disabled:opacity-50 mb-3"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </>
          )}

          {!email && (
            <p className="text-text-secondary/50 text-xs mb-4">
              No email on file. Go to{" "}
              <Link href="/login" className="text-accent-cyan">sign in</Link> and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
