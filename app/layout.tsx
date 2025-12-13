import "./globals.css";
import { baseMetadata } from "./seo.config";

export const metadata = baseMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
