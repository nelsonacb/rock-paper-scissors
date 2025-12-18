"use client"

import type React from "react"

import { useEffect } from "react"
import { useThemeStore } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  const isDark = useThemeStore((state) => state.isDark)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return <>{children}</>
}
