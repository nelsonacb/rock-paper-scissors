"use client"

import React, { useState } from "react"
import { useGameStore } from "@/lib/store"
import { Copy, Check, User } from "lucide-react"

interface CreateRoomSectionProps {
  onRoomCreated: (playerName: string) => void
  isLoading?: boolean
  generatedCode?: string | null
}

export function CreateRoomSection({ onRoomCreated, isLoading, generatedCode }: CreateRoomSectionProps) {
  const [copied, setCopied] = React.useState(false)
  const [playerName, setPlayerName] = useState("")

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = playerName.trim()
    console.log("[v0] CreateRoomSection handleSubmit - playerName:", trimmedName)

    if (!trimmedName) {
      console.log("[v0] CreateRoomSection - name is empty")
      return
    }

    useGameStore.setState({ playerName: trimmedName })
    console.log("[v0] CreateRoomSection calling onRoomCreated with:", trimmedName)
    onRoomCreated(trimmedName)
  }

  if (generatedCode) {
    return (
      <div className="card-base text-center space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Room Created!</h3>
          <p className="text-sm text-muted-foreground mb-4">Share this code with your friend to join</p>
        </div>

        <div className="bg-muted p-6 rounded-lg border-2 border-primary/20">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Room Code</p>
          <p className="text-5xl font-bold font-mono text-primary mb-6 tracking-wider">{generatedCode}</p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 btn-secondary transition-all hover:scale-105"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Waiting for opponent to join...</p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-base space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Create a New Room</h3>
        <p className="text-sm text-muted-foreground mb-4">Enter your name to create a game room</p>
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

        <button type="submit" disabled={!playerName.trim() || isLoading} className="btn-primary w-full">
          {isLoading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  )
}
