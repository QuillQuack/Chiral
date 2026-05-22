"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const passwordScore = form.password.length > 0
    ? form.password.length < 8 ? "F" : form.password.length < 10 ? "C-" : "B"
    : "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match. Did you forget your own password already?");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. The server is probably on a coffee break.");
        setLoading(false);
        return;
      }

      router.push(`/verify-email/pending?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("Network error. Try turning it off and on again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-cyan bg-clip-text text-transparent">
              Chiral
            </span>
            <span className="text-2xl font-bold text-text-primary">Downloads</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create Your Account
          </h1>
          <p className="text-text-secondary text-sm">
            It&apos;s safer than most things you do online. Probably.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-3 rounded-xl font-medium text-text-primary bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-dark-bg px-3 text-text-secondary">or sign up with email</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark-secondary rounded-2xl border border-white/5 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-text-secondary text-sm font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={handleChange("username")}
              required
              minLength={3}
              maxLength={30}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              placeholder="xX_DaRk_HaXoR_Xx"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
              minLength={8}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              placeholder="••••••••"
            />
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    form.password.length >= 10
                      ? "w-3/4 bg-yellow-500"
                      : form.password.length >= 8
                      ? "w-1/2 bg-orange-500"
                      : form.password.length > 0
                      ? "w-1/4 bg-red-500"
                      : "w-0"
                  }`}
                />
              </div>
              <span className="text-xs text-text-secondary font-mono">
                {passwordScore}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-text-secondary text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
              minLength={8}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-white/10 bg-dark-bg text-accent-pink focus:ring-accent-pink/20"
            />
            <span className="text-text-secondary text-xs leading-relaxed">
              I agree to the soul-binding licensing agreement. I understand that my
              firstborn may be forfeit in case of piracy.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-text-secondary text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent-cyan hover:text-accent-pink transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>

        <p className="text-center text-text-secondary/40 text-xs mt-6">
          By signing up, you agree to receive daily emails about our sponsor,
          NordVPN (probably).
        </p>
      </div>
    </div>
  );
}
