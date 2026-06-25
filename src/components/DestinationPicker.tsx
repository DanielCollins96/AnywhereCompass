"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { searchPlaces, type GeocodeResult } from "@/lib/geocode";
import { saveLastPlace } from "@/lib/place-storage";
import type { CompassTarget } from "@/lib/target-url";

const MapPinPicker = dynamic(
  () => import("@/components/MapPinPicker").then((m) => m.MapPinPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl bg-[#2a2218]" />
    ),
  },
);

export function DestinationPicker() {
  const router = useRouter();
  const [tab, setTab] = useState<"search" | "map">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [status, setStatus] = useState("Ready");

  const goToCompass = useCallback(
    (target: CompassTarget) => {
      saveLastPlace(target);
      const params = new URLSearchParams({
        mode: "place",
        to: `${target.lat},${target.lng}`,
      });
      if (target.name) params.set("name", target.name);
      router.push(`/c?${params.toString()}`);
    },
    [router],
  );

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchError("Type a place first.");
      setStatus("No query");
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearched(true);
    setResults([]);
    setStatus(`Searching "${trimmed}"`);

    try {
      const places = await searchPlaces(trimmed);
      setResults(places);
      setStatus(`${places.length} result${places.length === 1 ? "" : "s"}`);
      if (places.length === 0) {
        setSearchError(`No results for "${trimmed}"`);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Search failed. Check your connection and try again.";
      setSearchError(message);
      setStatus("Search failed");
    } finally {
      setSearching(false);
    }
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void runSearch();
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#1a1410]">
      <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-[#d4af37]/20 bg-[#1a1410] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#2a2218] px-4 text-sm font-medium text-[#f5e6c8]"
        >
          ← Home
        </Link>
        <h1 className="font-serif text-lg text-[#f5e6c8]">Point to a place</h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
        <div className="mb-4 flex shrink-0 gap-2">
          {(["search", "map"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2.5 text-sm ${
                tab === t
                  ? "border border-[#d4af37]/50 bg-[#d4af37]/20 text-[#f5e6c8]"
                  : "border border-transparent bg-[#2a2218] text-[#c4b59a]"
              }`}
            >
              {t === "search" ? "Search" : "Drop pin"}
            </button>
          ))}
        </div>

        {tab === "search" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <form onSubmit={handleSearch} className="mb-3 flex shrink-0 gap-2">
              <input
                type="text"
                inputMode="search"
                autoComplete="street-address"
                autoCorrect="off"
                spellCheck={false}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchError(null);
                  setSearched(false);
                  setStatus("Ready");
                }}
                placeholder="Address or place name"
                enterKeyHint="search"
                className="min-h-12 flex-1 rounded-xl border border-[#d4af37]/30 bg-[#2a2218] px-4 text-base text-[#f5e6c8] placeholder:text-[#c4b59a]/50 outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                disabled={searching}
                className="min-h-12 shrink-0 rounded-xl border border-[#d4af37] bg-[#d4af37]/20 px-5 text-base font-medium text-[#f5e6c8] disabled:opacity-50"
              >
                {searching ? "…" : "Go"}
              </button>
            </form>

            <div className="mb-3 shrink-0 rounded-xl border border-[#d4af37]/20 bg-[#2a2218]/60 px-4 py-2 text-center text-xs text-[#c4b59a]">
              Status: {status}
            </div>

            {!searched && !searching && (
              <p className="mb-3 shrink-0 text-center text-sm text-[#c4b59a]">
                Type a place, then tap Go.
              </p>
            )}

            {searching && (
              <div className="mb-3 shrink-0 rounded-xl border border-[#d4af37]/30 bg-[#2a2218] px-4 py-3 text-center text-sm text-[#f5e6c8]">
                Searching {query.trim() ? `"${query.trim()}"` : "…"}
              </div>
            )}

            {searchError && (
              <div className="mb-3 shrink-0 rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {searchError}
              </div>
            )}

            {searched && !searching && results.length > 0 && (
              <p className="mb-2 shrink-0 rounded-lg bg-[#d4af37]/10 px-3 py-2 text-center text-sm font-medium text-[#d4af37]">
                {results.length} result{results.length === 1 ? "" : "s"} — tap one
              </p>
            )}

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <ul className="flex flex-col gap-2">
                {results.map((place) => (
                  <li key={`${place.lat}-${place.lng}`}>
                    <button
                      type="button"
                      onClick={() =>
                        goToCompass({
                          lat: place.lat,
                          lng: place.lng,
                          name: place.name,
                        })
                      }
                      className="w-full rounded-xl border border-[#d4af37]/30 bg-[#2a2218] px-4 py-4 text-left text-base leading-snug text-[#f5e6c8] active:bg-[#3a3020]"
                    >
                      {place.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
            <MapPinPicker onSelect={goToCompass} />
          </div>
        )}
      </div>
    </div>
  );
}
