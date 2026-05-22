"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { canViewAnalytics } from "@/lib/roles";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DayData {
  date: string;
  count: number;
  avg: number;
  anomaly: boolean;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [days, setDays] = useState<DayData[]>([]);
  const [total, setTotal] = useState(0);
  const [topPages, setTopPages] = useState<{ url: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !canViewAnalytics(session?.user?.role || "")) {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin/analytics")
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d) => {
          setDays(d.days || []);
          setTotal(d.total || 0);
          setTopPages(d.topPages || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && !canViewAnalytics(session?.user?.role || "")) {
    router.push("/");
    return null;
  }

  const avgDaily = days.length > 0 ? Math.round((total / days.length) * 10) / 10 : 0;
  const anomalyCount = days.filter((d) => d.anomaly).length;

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
            >
              &larr; Home
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
              <p className="text-2xl font-bold text-text-primary">{total}</p>
              <p className="text-xs text-text-secondary mt-1">Visits (30 days)</p>
            </div>
            <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
              <p className="text-2xl font-bold text-text-primary">{avgDaily}</p>
              <p className="text-xs text-text-secondary mt-1">Daily average</p>
            </div>
            <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
              <p className={`text-2xl font-bold ${anomalyCount > 0 ? "text-red-400" : "text-text-primary"}`}>
                {anomalyCount}
              </p>
              <p className="text-xs text-text-secondary mt-1">Anomalous days</p>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 mb-8">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Daily Traffic</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                    stroke="#ffffff0a"
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} stroke="#ffffff0a" />
                  <Tooltip
                    contentStyle={{ background: "#171A21", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", fontSize: "12px" }}
                    labelStyle={{ color: "#EAEAEA" }}
                    formatter={(value: any, name: any) => [value, name === "count" ? "Visits" : name]}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6EE7FF" strokeWidth={2} dot={(props: any) => {
                    if (!props?.payload) return null;
                    return <circle key={props.payload.date} cx={props.cx} cy={props.cy} r={props.payload.anomaly ? 5 : 2} fill={props.payload.anomaly ? "#FF4FD8" : "#6EE7FF"} />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-text-secondary/60 mt-3">
              Pink dots indicate anomalous traffic days (&gt;2σ above 7-day rolling average)
            </p>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Top Pages</h2>
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={p.url} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-5">{i + 1}.</span>
                    <span className="text-sm text-text-primary font-mono">{p.url}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{p.count} visits</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
