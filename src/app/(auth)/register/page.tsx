"use client";

import { useState } from "react";
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
    ? form.password.length < 4 ? "F" : form.password.length < 6 ? "D" : "C-"
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

      router.push("/login?registered=true");
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
              minLength={4}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              placeholder="••••••••"
            />
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    form.password.length > 6
                      ? "w-3/4 bg-yellow-500"
                      : form.password.length > 4
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
              minLength={4}
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
