import type { Metadata } from "next";
import { Suspense } from "react";

import { TryOnClient } from "./try-on-client";

export const metadata: Metadata = {
  title: "Try On",
  description:
    "Preview cosmetic rewards on your live camera feed before equipping them.",
};

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TryOnClient searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
