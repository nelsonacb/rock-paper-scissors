import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type Socket } from "socket.io"
import { type GameRoom, type GamePlayer, SocketEvents, getWinner, type RoundResult } from "./socket-types"

const rooms = new Map<string, GameRoom>()

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket: Socket) => {
    console.log("[Socket.io] Client connected:", socket.id)

    socket.on(SocketEvents.CREATE_ROOM, (data: { playerName: string }, callback) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()

      const newRoom: GameRoom = {
        id: roomId,
        players: [
          {
            id: socket.id,
            name: data.playerName,
            connected: true,
            choice: null,
          },
        ],
        currentRound: 1,
        maxRounds: 3,
        gameStarted: false,
        finished: false,
        scores: {
          [socket.id]: 0,
        },
        roundResults: [],
      }

      rooms.set(roomId, newRoom)
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.playerName = data.playerName

      console.log(`[Room ${roomId}] Created by ${data.playerName}`)
      callback({ success: true, roomId })

      io.to(roomId).emit(SocketEvents.ROOM_CREATED, {
        roomId,
        players: newRoom.players,
      })
    })

    socket.on(SocketEvents.JOIN_ROOM, (data: { roomId: string; playerName: string }, callback) => {
      const roomId = data.roomId
      const room = rooms.get(roomId)

      if (!room) {
        callback({ success: false, error: "Room not found" })
        return
      }

      if (room.players.length >= 2) {
        callback({ success: false, error: "Room is full" })
        return
      }

      if (room.gameStarted || room.finished) {
        callback({ success: false, error: "Game already in progress" })
        return
      }

      const newPlayer: GamePlayer = {
        id: socket.id,
        name: data.playerName,
        connected: true,
        choice: null,
      }

      room.players.push(newPlayer)
      room.scores[socket.id] = 0
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.playerName = data.playerName

      console.log(`[Room ${roomId}] ${data.playerName} joined (Total: ${room.players.length}/2)`)
      callback({ success: true, roomId, room })

      io.to(roomId).emit(SocketEvents.PLAYER_JOINED, {
        players: room.players,
        room,
      })

      // Game starts when 2 players join
      if (room.players.length === 2) {
        room.gameStarted = true
        setTimeout(() => {
          io.to(roomId).emit(SocketEvents.GAME_STARTED, {
            room,
            message: "Game is starting!",
          })
          io.to(roomId).emit(SocketEvents.ROUND_STARTED, {
            round: room.currentRound,
            room,
          })
        }, 1000)
      }
    })

    socket.on(SocketEvents.MAKE_CHOICE, (data: { choice: "rock" | "paper" | "scissors" }, callback) => {
      const roomId = socket.data.roomId
      const room = rooms.get(roomId)

      if (!room) {
        callback({ success: false, error: "Room not found" })
        return
      }

      const player = room.players.find((p) => p.id === socket.id)
      if (player) {
        player.choice = data.choice
      }

      console.log(`[Room ${roomId}] ${socket.data.playerName} chose ${data.choice}`)
      callback({ success: true })

      // Check if both players have made their choices
      if (room.players.every((p) => p.choice !== null)) {
        processRound(io, roomId, room)
      }
    })

    socket.on(SocketEvents.RESET_ROUND, () => {
      const roomId = socket.data.roomId
      const room = rooms.get(roomId)

      if (!room) return

      // Reset choices
      room.players.forEach((p) => {
        p.choice = null
      })

      room.currentRound++

      if (room.currentRound <= room.maxRounds) {
        // Check if anyone has already won the best of 3
        const player1Wins = room.scores[room.players[0].id] || 0
        const player2Wins = room.scores[room.players[1].id] || 0

        if (player1Wins >= 2 || player2Wins >= 2) {
          // Game is over
          room.finished = true
          room.gameStarted = false
          io.to(roomId).emit(SocketEvents.GAME_ENDED, {
            room,
            winner: player1Wins >= 2 ? room.players[0] : room.players[1],
            scores: room.scores,
          })
        } else {
          io.to(roomId).emit(SocketEvents.ROUND_STARTED, {
            round: room.currentRound,
            room,
          })
        }
      } else {
        room.finished = true
        room.gameStarted = false
        const player1Wins = room.scores[room.players[0].id] || 0
        io.to(roomId).emit(SocketEvents.GAME_ENDED, {
          room,
          winner: player1Wins >= 2 ? room.players[0] : room.players[1],
          scores: room.scores,
        })
      }
    })

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId
      if (!roomId) return

      const room = rooms.get(roomId)
      if (!room) return

      const player = room.players.find((p) => p.id === socket.id)
      if (player) {
        player.connected = false
      }

      console.log(`[Room ${roomId}] ${socket.data.playerName} disconnected`)
      io.to(roomId).emit(SocketEvents.PLAYER_DISCONNECTED, {
        players: room.players,
        room,
      })

      // Clean up empty rooms after 30 seconds
      setTimeout(() => {
        if (!room.players.some((p) => p.connected)) {
          rooms.delete(roomId)
          console.log(`[Room ${roomId}] Deleted due to inactivity`)
        }
      }, 30000)
    })
  })

  return io
}

function processRound(io: SocketIOServer, roomId: string, room: GameRoom) {
  const [player1, player2] = room.players

  const winner = getWinner(
    player1.choice as "rock" | "paper" | "scissors",
    player2.choice as "rock" | "paper" | "scissors",
  )

  const result: RoundResult = {
    round: room.currentRound,
    player1: {
      id: player1.id,
      choice: player1.choice!,
    },
    player2: {
      id: player2.id,
      choice: player2.choice!,
    },
    winner: winner === "draw" ? "draw" : winner === 1 ? player1.id : player2.id,
  }

  room.roundResults.push(result)

  // Update scores
  if (winner === 1) {
    room.scores[player1.id] = (room.scores[player1.id] || 0) + 1
  } else if (winner === 2) {
    room.scores[player2.id] = (room.scores[player2.id] || 0) + 1
  }

  console.log(
    `[Room ${roomId}] Round ${room.currentRound}: ${
      winner === "draw" ? "Draw" : winner === 1 ? player1.name : player2.name
    } wins`,
  )

  io.to(roomId).emit(SocketEvents.ROUND_ENDED, {
    result,
    scores: room.scores,
    room,
  })
}
