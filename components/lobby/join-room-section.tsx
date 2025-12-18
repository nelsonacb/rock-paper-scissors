"use client"

import type React from "react"

import { useState } from "react"
import { useGameStore } from "@/lib/store"
import { LogIn, User } from "lucide-react"

interface JoinRoomSectionProps {
  onRoomJoined: (code: string) => void
  isLoading?: boolean
}

export function JoinRoomSection({ onRoomJoined, isLoading }: JoinRoomSectionProps) {
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.trim() && playerName.trim()) {
      console.log("[v0] Submitting join room:", { roomCode, playerName })
      useGameStore.setState({ playerName: playerName.trim() })
      onRoomJoined(roomCode.toUpperCase())
    }
  }

  return (
    <div className="card-base space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Join a Room</h3>
        <p className="text-sm text-muted-foreground mb-4">Enter your name and room code to join your friend</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium mb-2">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isLoading}
              maxLength={20}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{playerName.length}/20 characters</p>
        </div>

        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
            Room Code
          </label>
          <input
            id="roomCode"
            type="text"
            placeholder="e.g., ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={isLoading}
            maxLength={6}
            className="w-full px-4 py-2.5 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-center text-lg tracking-wider"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Ask your friend for their room code</p>
        </div>

        <button
          type="submit"
          disabled={!roomCode.trim() || !playerName.trim() || isLoading}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {isLoading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </div>
  )
}
