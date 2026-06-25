import { CompassPageClient } from "@/components/CompassPageClient";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    to?: string;
    name?: string;
    q?: string;
  }>;
};

export default async function CompassPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <CompassPageClient
      mode={params.mode ?? null}
      to={params.to ?? null}
      name={params.name ?? null}
      q={params.q ?? null}
    />
  );
}
