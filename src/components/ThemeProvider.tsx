"use client";

import { createContext, useContext, useEffect } from "react";

const ThemeCtx = createContext<{ theme: "dark"; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.removeItem("theme");
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: "dark", toggle: () => {} }}>
      {children}
    </ThemeCtx.Provider>
  );
}
