"use client";

import { useEffect, useState } from "react";

export function DevNetworkHint() {
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const { hostname, port, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setHint(
        "On your phone, use your computer's IP instead of localhost — e.g. http://192.168.x.x:3000",
      );
    } else {
      setHint(`Phone URL: ${protocol}//${hostname}${port ? `:${port}` : ""}`);
    }
  }, []);

  if (!hint) return null;

  return (
    <p className="max-w-sm text-center text-xs leading-relaxed text-[#c4b59a]/80">
      {hint}
    </p>
  );
}
