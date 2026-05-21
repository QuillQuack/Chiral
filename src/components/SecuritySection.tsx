"use client";

import { useState } from "react";

const checksum = "a3f5b8c1d2e4f7a9b0c3d6e8f1a4b7c9d0e2f5a8b1c4d7e0f3a6b9c2d5e8f1";

export default function SecuritySection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(checksum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="security" className="relative z-10 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-accent-cyan text-xs font-medium tracking-widest uppercase mb-4 block">
            Transparency Report
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            We Have Nothing to Hide
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Every file is scanned, verified, and triple-checked by our
            world-class security team (it&apos;s Dave from accounting).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 hover:border-green-500/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-text-primary font-semibold">VirusTotal</div>
                <div className="text-text-secondary text-xs">Integrated Scanner</div>
              </div>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No engines detected this file
              </div>
              <div className="text-text-secondary text-xs">
                Last scanned: 2 minutes ago · 72 engines
              </div>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 hover:border-accent-cyan/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="text-text-primary font-semibold">SHA-256</div>
                <div className="text-text-secondary text-xs">Checksum Verification</div>
              </div>
            </div>
            <div className="bg-dark-bg border border-white/5 rounded-xl p-4">
              <div className="text-text-secondary text-xs mb-2 font-mono">SHA256 Checksum</div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-text-primary font-mono break-all flex-1">
                  {checksum}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 hover:border-accent-pink/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-pink/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-text-primary font-semibold">Zero Tolerance</div>
                <div className="text-text-secondary text-xs">Security Policy</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "No Adware", ok: true },
                { label: "No Crypto Miner", ok: true },
                { label: "No Redirects", ok: true },
                { label: "No Fake Download Buttons", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <svg className={`w-4 h-4 ${item.ok ? "text-green-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.ok ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  <span className="text-text-primary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
