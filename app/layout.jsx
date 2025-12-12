import "./globals.css";

export const metadata = {
  title: "DM Note",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
