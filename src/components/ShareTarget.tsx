"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

type ShareTargetProps = {
  url: string;
  label?: string;
};

export function ShareTarget({ url, label = "Share destination" }: ShareTargetProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[#d4af37]/40 bg-[#2a2218]/80 px-4 py-2 text-xs text-[#f5e6c8] backdrop-blur"
      >
        Share
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#d4af37]/30 bg-[#1a1410] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-serif text-lg text-[#f5e6c8]">{label}</h2>
            <div className="mx-auto mb-4 inline-block rounded-xl bg-white p-3">
              <QRCodeSVG value={url} size={160} />
            </div>
            <p className="mb-4 break-all text-xs text-[#c4b59a]">{url}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-full border border-[#d4af37] py-3 text-sm text-[#f5e6c8]"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-[#2a2218] py-3 text-sm text-[#c4b59a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
