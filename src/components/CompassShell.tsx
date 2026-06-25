import Link from "next/link";
import Script from "next/script";
import { VanillaBoot } from "@/components/VanillaBoot";
import type { CompassTarget } from "@/lib/target-url";

type CompassShellProps = {
  target: CompassTarget;
};

export function CompassShell({ target }: CompassShellProps) {
  const title = target.name ?? "Destination";

  return (
    <>
      <div
        id="compass-app"
        className="flex min-h-dvh flex-col bg-[#1a1410] px-4 py-8"
        data-lat={target.lat}
        data-lng={target.lng}
        data-name={title}
      >
        <div className="flex w-full max-w-md items-start justify-between gap-2">
          <Link
            href="/"
            className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#c4b59a]"
          >
            ← Home
          </Link>
        </div>

        <div
          id="compass-prompt"
          className="mx-auto mt-6 w-full max-w-md space-y-3"
        >
          <p className="text-center text-sm text-[#c4b59a]">
            Tap below — your browser will ask to use your location so the compass
            can point toward <span className="text-[#f5e6c8]">{title}</span>.
          </p>
          <button
            id="compass-start-btn"
            type="button"
            className="w-full rounded-full border-2 border-[#d4af37] bg-[#2a2218] px-6 py-4 text-base font-medium text-[#f5e6c8]"
          >
            Allow location &amp; start compass
          </button>
          <p
            id="compass-status"
            className="rounded-xl border border-[#d4af37]/20 bg-[#2a2218]/60 px-4 py-3 text-center text-sm text-[#c4b59a]"
          >
            Ready
          </p>
        </div>

        <VanillaBoot
          kind="compass"
          bootKey={`${target.lat},${target.lng},${title}`}
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#d4af37]/70">
              Place mode
            </p>
            <h1 className="mt-1 max-w-xs font-serif text-lg text-[#f5e6c8] line-clamp-2">
              {title}
            </h1>
          </div>

          <div className="relative aspect-square w-full max-w-[min(85vw,360px)]">
            <div
              className="absolute inset-0 rounded-full border-4 border-[#d4af37]/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.4)]"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, #3d3428 0%, #1a1410 55%, #0d0a08 100%)",
              }}
            >
              <span className="absolute left-1/2 top-[6%] -translate-x-1/2 font-serif text-sm font-bold text-[#c0392b]">
                N
              </span>
              <span className="absolute right-[6%] top-1/2 -translate-y-1/2 font-serif text-sm font-bold text-[#d4af37]/80">
                E
              </span>
              <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 font-serif text-sm font-bold text-[#d4af37]/80">
                S
              </span>
              <span className="absolute left-[6%] top-1/2 -translate-y-1/2 font-serif text-sm font-bold text-[#d4af37]/80">
                W
              </span>

              <div className="absolute inset-[12%] rounded-full border border-[#d4af37]/20" />
              <div className="absolute inset-[22%] rounded-full border border-[#d4af37]/10" />
              <div className="absolute inset-[32%] rounded-full border border-[#d4af37]/10" />

              <div
                id="compass-needle-wrap"
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                style={{ transform: "rotate(0deg)" }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-[55%] w-[55%] drop-shadow-lg"
                  aria-hidden
                >
                  <polygon
                    points="50,8 54,50 50,44 46,50"
                    fill="#c0392b"
                    stroke="#8b2020"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points="50,92 54,50 50,56 46,50"
                    fill="#bdc3c7"
                    stroke="#7f8c8d"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="4"
                    fill="#d4af37"
                    stroke="#8b7355"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p
              id="compass-distance"
              className="font-serif text-3xl text-[#f5e6c8]"
            />
            <p id="compass-bearing" className="text-xs text-[#c4b59a]" />
          </div>
        </div>
      </div>

      <Script src="/compass-heading.js" strategy="beforeInteractive" />
      <Script src="/compass.js" strategy="afterInteractive" />
    </>
  );
}
