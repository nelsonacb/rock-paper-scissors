"use client"

import type { GameRoom } from "@/lib/socket-types"
import { Trophy, ArrowRight, LogOut, Users } from "lucide-react"

interface GameResultsProps {
  room: GameRoom
  scores: { [key: string]: number }
  onPlayAgain: () => void
  onDisconnect: () => void
  waitingForRematch?: boolean
  rematchPlayersReady?: number
}

export function GameResults({
  room,
  scores,
  onPlayAgain,
  onDisconnect,
  waitingForRematch = false,
  rematchPlayersReady = 0,
}: GameResultsProps) {
  const [player1, player2] = room.players

  const player1Score = scores[player1.id] || 0
  const player2Score = scores[player2.id] || 0

  const winner = player1Score >= 2 ? player1 : player2Score >= 2 ? player2 : null

  if (!winner) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
        <div className="card-base max-w-md w-full text-center space-y-8">
          <p className="text-xl">Error: No winner determined</p>
          <button onClick={onDisconnect} className="btn-primary w-full">
            Return to Lobby
          </button>
        </div>
      </div>
    )
  }

  const isPlayer1Winner = winner.id === player1.id
  const loser = isPlayer1Winner ? player2 : player1

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="card-base max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Game Over!</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Winner</p>
            <p className="text-4xl font-bold text-primary mb-1">{winner.name}</p>
            <p className="text-lg text-muted-foreground">Congratulations! You won the match!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-muted p-6 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{player1.name}</p>
              <p className={`text-4xl font-bold ${isPlayer1Winner ? "text-primary" : "text-muted-foreground"}`}>
                {player1Score}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{player2.name}</p>
              <p className={`text-4xl font-bold ${!isPlayer1Winner ? "text-primary" : "text-muted-foreground"}`}>
                {player2Score}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {waitingForRematch ? (
            <div className="btn-primary w-full opacity-75 cursor-not-allowed inline-flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Waiting for opponent ({rematchPlayersReady}/2)
              <div className="flex gap-1 ml-2">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          ) : (
            <button
              onClick={onPlayAgain}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 group"
            >
              Play Again
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <button
            onClick={onDisconnect}
            disabled={waitingForRematch}
            className="btn-ghost w-full inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave Room
          </button>
        </div>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          Final score: {winner.name} wins {Math.max(player1Score, player2Score)}-{Math.min(player1Score, player2Score)}
        </p>
      </div>
    </div>
  )
}
