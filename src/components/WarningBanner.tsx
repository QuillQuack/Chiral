"use client";

import { useEffect, useRef, useState } from "react";

export default function WarningBanner() {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let current = 0;
          const target = 37;
          const step = Math.ceil(target / 30);
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(current);
            }
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-pink/10 via-accent-cyan/10 to-accent-pink/10 border border-accent-pink/20 p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/5 to-accent-cyan/5 animate-glow-pulse" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary">
              ⚡ Live Protection Report
            </div>

            <div className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-accent-pink to-accent-cyan bg-clip-text mb-2">
              {count}
            </div>

            <p className="text-text-primary text-lg sm:text-xl font-semibold mb-2">
              fake download buttons avoided today.
            </p>

            <p className="text-text-secondary text-sm">
              Nice reflexes. You&apos;re basically a cybersecurity expert now.
              {count >= 37 && " 🎉"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
