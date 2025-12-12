import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ScrollRestorationScript } from "./ScrollRestorationScript";

import "./site.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollRestorationScript />
      <Navbar />
      {children}
    </>
  );
}
