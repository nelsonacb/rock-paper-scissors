"use client"

import { useEffect, useState } from "react"
import type { Socket } from "socket.io-client"
import { Header } from "@/components/header"
import { LobbyView } from "@/components/lobby/lobby-view"
import { GameView } from "@/components/game/game-view"
import { NotificationsContainer } from "@/components/notifications/notifications-container"
import { useGameStore } from "@/lib/store"
import { useNotifications } from "@/hooks/use-notifications"
import { initializeSocketClient, disconnectSocket } from "@/lib/socket-client"
import { SocketEvents } from "@/lib/socket-types"

export default function Home() {
  const roomCode = useGameStore((state) => state.roomCode)
  const [gameState, setGameState] = useState<"lobby" | "waiting" | "game">("lobby")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const notifications = useNotifications()

  useEffect(() => {
    console.log("[v0] Initializing socket connection...")
    const socketInstance = initializeSocketClient()
    setSocket(socketInstance)

    return () => {
      // Don't disconnect on unmount to allow reconnection
    }
  }, [])

  const handleCreateRoom = (playerName: string) => {
    console.log("[v0] handleCreateRoom called with playerName:", playerName)

    if (!socket) {
      console.log("[v0] Socket not ready")
      notifications.error("Error", "Connection not ready. Please refresh.")
      return
    }

    if (!playerName || !playerName.trim()) {
      console.log("[v0] handleCreateRoom - playerName is empty:", playerName)
      notifications.error("Error", "Please enter your name")
      return
    }

    const trimmedName = playerName.trim()
    console.log("[v0] Creating room with playerName:", trimmedName)

    useGameStore.setState({ playerName: trimmedName })
    setIsLoading(true)

    socket.emit(
      SocketEvents.CREATE_ROOM,
      { playerName: trimmedName },
      (response: { success: boolean; roomId?: string; error?: string }) => {
        console.log("[v0] CREATE_ROOM response:", response)
        setIsLoading(false)

        if (response.success && response.roomId) {
          console.log("[v0] Room created successfully:", response.roomId)
          useGameStore.setState({ roomCode: response.roomId })
          setGeneratedCode(response.roomId)
          setGameState("waiting")
          setIsCreator(true)
        } else {
          console.error("[v0] Failed to create room:", response.error)
          notifications.error("Error", response.error || "Failed to create room")
        }
      },
    )
  }

  const handleJoinRoom = (code: string) => {
    if (!socket) {
      console.log("[v0] Socket not ready")
      notifications.error("Error", "Connection not ready. Please refresh.")
      return
    }

    if (!code.trim()) {
      notifications.error("Error", "Please enter room code")
      return
    }

    const playerName = useGameStore.getState().playerName

    if (!playerName) {
      notifications.error("Error", "Please enter your name")
      return
    }

    console.log("[v0] Joining room:", code, "with playerName:", playerName)
    setIsLoading(true)

    socket.emit(
      SocketEvents.JOIN_ROOM,
      { roomId: code.toUpperCase(), playerName },
      (response: { success: boolean; roomId?: string; error?: string; room?: any }) => {
        console.log("[v0] JOIN_ROOM response:", response)
        setIsLoading(false)

        if (response.success) {
          console.log("[v0] Joined room successfully:", response.roomId)
          useGameStore.setState({ roomCode: response.roomId })
          notifications.success("Joined Room", "Waiting for game to start...")
          setGameState("game")
          setIsCreator(false)
        } else {
          console.error("[v0] Failed to join room:", response.error)
          notifications.error("Error", response.error || "Failed to join room")
        }
      },
    )
  }

  const handleGameStart = (data: string, creator: boolean) => {
    console.log("[v0] Game start requested:", { data, creator })
    setIsCreator(creator)

    if (creator) {
      // data is playerName when creating
      handleCreateRoom(data)
    } else {
      // data is room code when joining
      handleJoinRoom(data)
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleGameStarted = (data: any) => {
      console.log("[v0] GAME_STARTED event received:", data)
      setGameState("game")
      notifications.info("Game Started", "Make your choice!")
    }

    socket.on(SocketEvents.GAME_STARTED, handleGameStarted)

    return () => {
      socket.off(SocketEvents.GAME_STARTED, handleGameStarted)
    }
  }, [socket, notifications])

  const handleGameEnd = () => {
    console.log("[v0] Game ended, returning to lobby")
    useGameStore.setState({ gameState: "lobby", roomCode: null, playerName: "" })
    setGameState("lobby")
    setGeneratedCode(null)
    disconnectSocket()
    setTimeout(() => {
      const newSocket = initializeSocketClient()
      setSocket(newSocket)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <NotificationsContainer />

      {gameState === "lobby" || gameState === "waiting" ? (
        <LobbyView onGameStart={handleGameStart} isLoading={isLoading} generatedCode={generatedCode} />
      ) : socket ? (
        <GameView socket={socket} roomCode={roomCode || ""} isCreator={isCreator} onGameEnd={handleGameEnd} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      )}
    </main>
  )
}
