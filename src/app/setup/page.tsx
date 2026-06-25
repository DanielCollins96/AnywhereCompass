import Link from "next/link";
import { fetchPhotonSearch } from "@/lib/photon";

type SetupPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  let results: Awaited<ReturnType<typeof fetchPhotonSearch>> = [];
  let error: string | null = null;

  if (q) {
    try {
      results = await fetchPhotonSearch(q);
    } catch {
      error = "Search failed. Try another place.";
    }
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

      <main className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="mb-4 flex shrink-0 gap-2">
          <div className="flex-1 rounded-full border border-[#d4af37]/50 bg-[#d4af37]/20 py-2.5 text-center text-sm text-[#f5e6c8]">
            Search
          </div>
          <div className="flex-1 rounded-full border border-transparent bg-[#2a2218] py-2.5 text-center text-sm text-[#c4b59a]">
            Drop pin soon
          </div>
        </div>

        <form action="/setup" method="get" className="mb-3 flex shrink-0 gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            inputMode="search"
            autoComplete="street-address"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Address or place name"
            enterKeyHint="search"
            className="min-h-12 flex-1 rounded-xl border border-[#d4af37]/30 bg-[#2a2218] px-4 text-base text-[#f5e6c8] placeholder:text-[#c4b59a]/50 outline-none focus:border-[#d4af37]"
          />
          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-xl border border-[#d4af37] bg-[#d4af37]/20 px-5 text-base font-medium text-[#f5e6c8]"
          >
            Go
          </button>
        </form>

        <div className="mb-3 shrink-0 rounded-xl border border-[#d4af37]/20 bg-[#2a2218]/60 px-4 py-2 text-center text-xs text-[#c4b59a]">
          {q ? `Server searched: "${q}"` : "Type a place, then tap Go."}
        </div>

        {error && (
          <div className="mb-3 shrink-0 rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {q && !error && results.length === 0 && (
          <div className="mb-3 shrink-0 rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            No results for "{q}".
          </div>
        )}

        {results.length > 0 && (
          <p className="mb-2 shrink-0 rounded-lg bg-[#d4af37]/10 px-3 py-2 text-center text-sm font-medium text-[#d4af37]">
            {results.length} result{results.length === 1 ? "" : "s"} — tap one
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ul className="flex flex-col gap-2">
            {results.map((place) => {
              const search = new URLSearchParams({
                mode: "place",
                to: `${place.lat},${place.lng}`,
                name: place.name,
              });

              return (
                <li key={`${place.lat}-${place.lng}`}>
                  <Link
                    href={`/c?${search.toString()}`}
                    className="block w-full rounded-xl border border-[#d4af37]/30 bg-[#2a2218] px-4 py-4 text-left text-base leading-snug text-[#f5e6c8] active:bg-[#3a3020]"
                  >
                    {place.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
