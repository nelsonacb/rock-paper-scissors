"use client";

import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-2xl md:text-3xl">🎮</div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">
              Rock Paper Scissors
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Multiplayer Real-time Game
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-muted rounded-lg transition-colors ml-2"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
