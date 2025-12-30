import { Suspense } from "react";
import RecapPageClient from "./RecapPageClient";

export const dynamic = "force-dynamic";

export default function RecapPage() {
  return (
    <Suspense fallback={null}>
      <RecapPageClient />
    </Suspense>
  );
}
