"use client"

import { RotateCcw, LogOut } from "lucide-react"

interface GameMenuProps {
  onPlayAgain: () => void
  onDisconnect: () => void
  disabled?: boolean
  waitingForRematch?: boolean
}

export function GameMenu({ onPlayAgain, onDisconnect, disabled, waitingForRematch }: GameMenuProps) {
  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      <button
        onClick={onPlayAgain}
        disabled={disabled || waitingForRematch}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        title="Play Again"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Play Again</span>
      </button>
      <button
        onClick={onDisconnect}
        disabled={waitingForRematch}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        title="Disconnect"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    </div>
  )
}
