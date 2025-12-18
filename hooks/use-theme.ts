"use client"

import { useThemeStore } from "@/lib/store"

export function useTheme() {
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return { isDark, toggleTheme, setTheme }
}
