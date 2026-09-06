"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dm-site:scrollY";

export function ScrollRestorationFix() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const saveScroll = () => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, String(window.scrollY ?? 0));
      } catch {
        // ignore
      }
    };

    const restoreScroll = () => {
      let saved = 0;
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        saved = raw ? Number(raw) : 0;
      } catch {
        return;
      }

      if (!Number.isFinite(saved) || saved <= 0) return;

      window.scrollTo({ top: saved, left: 0, behavior: "auto" });
    };

    // Save on reload/navigation away
    window.addEventListener("pagehide", saveScroll);

    // Restore after layout/paint, and again after full load (fonts/images).
    requestAnimationFrame(() => {
      requestAnimationFrame(restoreScroll);
    });

    if (document.readyState === "complete") {
      restoreScroll();
    } else {
      window.addEventListener("load", restoreScroll, { once: true });
    }

    return () => {
      window.removeEventListener("pagehide", saveScroll);
      window.removeEventListener("load", restoreScroll);
    };
  }, []);

  return null;
}
