"use client";

import { useEffect } from "react";

export default function RecapStyleScope() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.dataset.recap = "1";
    body.classList.add("recap-mode");

    return () => {
      delete root.dataset.recap;
      body.classList.remove("recap-mode");
    };
  }, []);

  return null;
}
