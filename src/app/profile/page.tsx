"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trustScore] = useState(() => Math.floor(Math.random() * 40) + 60);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink to-accent-cyan flex items-center justify-center text-2xl font-bold text-dark-bg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {session.user.name}
              </h1>
              <p className="text-text-secondary text-sm">{session.user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-pink/10 text-accent-pink border border-accent-pink/20">
                {session.user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Downloads", value: "0", color: "from-accent-pink to-accent-pink/50" },
              { label: "Viruses Dodged", value: "∞", color: "from-accent-cyan to-accent-cyan/50" },
              { label: "Trust Score", value: `${trustScore}%`, color: "from-green-400 to-emerald-500" },
              { label: "Fake Buttons", value: "37+", color: "from-yellow-400 to-orange-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-dark-bg rounded-xl border border-white/5 p-4 text-center"
              >
                <div
                  className={`text-2xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-text-secondary text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <Link
              href="/"
              className="block w-full py-3 text-center rounded-xl text-text-primary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all text-sm font-medium"
            >
              Back to Safety (Browse Games)
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full py-3 rounded-xl text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
