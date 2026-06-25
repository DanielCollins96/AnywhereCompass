"use client";

type PermissionPromptProps = {
  onEnable: () => void;
  loading?: boolean;
};

export function PermissionPrompt({ onEnable, loading }: PermissionPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#1a1410] px-8 text-center">
      <div className="text-5xl">🧭</div>
      <h1 className="font-serif text-2xl text-[#f5e6c8]">Enable your compass</h1>
      <p className="max-w-xs text-sm leading-relaxed text-[#c4b59a]">
        We need your location and device orientation so the needle can point the
        right way.
      </p>
      <button
        type="button"
        onClick={onEnable}
        disabled={loading}
        className="rounded-full border-2 border-[#d4af37] bg-[#2a2218] px-8 py-4 font-medium text-[#f5e6c8] transition hover:bg-[#3a3020] disabled:opacity-50"
      >
        {loading ? "Starting…" : "Enable compass"}
      </button>
    </div>
  );
}
