"use client";

import dynamic from "next/dynamic";

export const KeyViewerPreviewNoSSR = dynamic(
  () => import("./KeyViewerPreview").then((m) => m.KeyViewerPreview),
  { ssr: false }
);
