import Script from "next/script";
import { VanillaBoot } from "@/components/VanillaBoot";

export function PinPickerShell() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <p className="shrink-0 text-sm text-[#c4b59a]">
          Tap the map to drop a pin, then confirm to open the compass.
        </p>

        <div
          id="pin-map"
          className="min-h-[min(55vh,420px)] flex-1 overflow-hidden rounded-xl border border-[#d4af37]/30"
        />

        <p
          id="pin-coords"
          hidden
          className="shrink-0 text-center text-xs text-[#c4b59a]"
        />

        <button
          id="pin-use-btn"
          type="button"
          hidden
          className="shrink-0 rounded-xl border border-[#d4af37] bg-[#2a2218] py-3 text-base font-medium text-[#f5e6c8] disabled:opacity-50"
        >
          Use this pin
        </button>

        <p
          id="pin-status"
          className="shrink-0 rounded-xl border border-[#d4af37]/20 bg-[#2a2218]/60 px-4 py-2 text-center text-xs text-[#c4b59a]"
        >
          Loading map…
        </p>
      </div>

      <VanillaBoot kind="pin-picker" bootKey="pin" />

      <Script src="/pin-picker.js" strategy="afterInteractive" />
    </>
  );
}
