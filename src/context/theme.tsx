"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "recap-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "light";
  });

  const setThemeInstant = (nextTheme: ThemeMode) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      setThemeState(nextTheme);
      return;
    }

    const root = document.documentElement;
    root.classList.add("theme-switching");
    setThemeState(nextTheme);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const prevTheme = root.dataset.recapPrevTheme;
    const prevDark = root.dataset.recapPrevDark;
    const prevColorScheme = root.dataset.recapPrevColorScheme;

    return () => {
      if (
        typeof prevTheme === "undefined" &&
        typeof prevDark === "undefined" &&
        typeof prevColorScheme === "undefined"
      ) {
        return;
      }
      if (prevTheme) {
        root.dataset.theme = prevTheme;
      } else {
        delete root.dataset.theme;
      }
      root.classList.toggle("dark", prevDark === "1");
      if (prevColorScheme) {
        root.style.colorScheme = prevColorScheme;
      } else {
        root.style.removeProperty("color-scheme");
      }
      delete root.dataset.recapPrevTheme;
      delete root.dataset.recapPrevDark;
      delete root.dataset.recapPrevColorScheme;
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setThemeInstant(theme === "dark" ? "light" : "dark"),
      setTheme: setThemeInstant,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
