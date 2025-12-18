"use client"

import type { GamePlayer } from "@/lib/socket-types"

interface PlayerStatusProps {
  player: GamePlayer | null
  isYou?: boolean
  score?: number
  choice?: string | null
}

export function PlayerStatus({ player, isYou, score, choice }: PlayerStatusProps) {
  if (!player)
    return (
      <div className="card-base text-center py-4">
        <p className="text-sm text-muted-foreground">Waiting for player...</p>
      </div>
    )

  return (
    <div className="card-base text-center space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">{isYou ? "You" : "Opponent"}</p>
        <p className="text-lg font-bold">{player.name}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
        <span className="text-xs font-medium text-success">{player.connected ? "Connected" : "Disconnected"}</span>
      </div>

      {score !== undefined && <div className="text-2xl font-bold text-primary">{score}</div>}

      {choice && (
        <div className="text-4xl pt-2">
          {choice === "rock" && "✊"}
          {choice === "paper" && "✋"}
          {choice === "scissors" && "✌️"}
        </div>
      )}
    </div>
  )
}
