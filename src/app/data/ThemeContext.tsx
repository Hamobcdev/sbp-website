"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type DashboardTheme = "dark" | "light";

const ThemeContext = createContext<{
  theme: DashboardTheme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

const STORAGE_KEY = "pdc-dashboard-theme";

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<DashboardTheme>("dark");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — keep default
    }
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div data-pdc-theme={theme} className="pdc-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  return useContext(ThemeContext);
}
