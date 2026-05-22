"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import NotificationBell from "./NotificationBell";
import { isAdmin, canViewAnalytics } from "@/lib/roles";

const links = [
  { label: "Browse", href: "/browse" },
  { label: "Forums", href: "/forums" },
  { label: "Safety Center", href: "/safety" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark-bg/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-cyan bg-clip-text text-transparent">
                Chiral
              </span>
              <span className="text-2xl font-bold text-text-primary">
                Downloads
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              {session && (session.user?.role === "OWNER" || isAdmin(session.user?.role || "")) && (
                <span className="w-px h-4 bg-white/10" />
              )}
              {session && session.user?.role === "OWNER" && (
                <a
                  href="/admin"
                  className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Employees
                </a>
              )}
              {session && isAdmin(session.user?.role || "") && (
                <a
                  href="/admin/games"
                  className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Games
                </a>
              )}
              {session && canViewAnalytics(session.user?.role || "") && (
                <a
                  href="/admin/analytics"
                  className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Analytics
                </a>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <NotificationBell />
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-pink to-accent-cyan flex items-center justify-center text-xs font-bold text-dark-bg hover:shadow-[0_0_15px_-3px_rgba(255,79,216,0.5)] transition-all"
                  aria-label="Profile"
                >
                  {session.user?.name?.slice(0, 2).toUpperCase() || "U"}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Sign in"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {session && (session.user?.role === "OWNER" || isAdmin(session.user?.role || "")) && (
              <div className="border-t border-white/5 my-2 pt-2" />
            )}
            {session && session.user?.role === "OWNER" && (
              <a
                href="/admin"
                className="block py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Employees
              </a>
            )}
            {session && isAdmin(session.user?.role || "") && (
              <a
                href="/admin/games"
                className="block py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Games
              </a>
            )}
            {session && canViewAnalytics(session.user?.role || "") && (
              <a
                href="/admin/analytics"
                className="block py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Analytics
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
