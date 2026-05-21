"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const data = { url: pathname };

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/visit", JSON.stringify(data));
    } else {
      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
