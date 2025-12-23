import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import type { GameRoom, GamePlayer } from "../lib/socket-types";
import { SocketEvents, processRound } from "../lib/socket-types";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL || "*",
    ],
    methods: ["GET", "POST"],
  },
});

const rooms = new Map<string, GameRoom>();
const playAgainRequests = new Map<string, Set<string>>();

io.on("connection", (socket: Socket) => {
  console.log("Socket.io Client connected:", socket.id);

  socket.on(
    SocketEvents.CREATE_ROOM,
    (data: { playerName: string }, callback) => {
      try {
        console.log("CREATE_ROOM event received:", {
          playerName: data.playerName,
          socketId: socket.id,
        });

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

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
        };

        rooms.set(roomId, newRoom);
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.playerName = data.playerName;

        console.log(`Room ${roomId} created by ${data.playerName}`);
        callback({ success: true, roomId });

        io.to(roomId).emit(SocketEvents.ROOM_CREATED, {
          roomId,
          players: newRoom.players,
        });
      } catch (error) {
        console.error("Error in CREATE_ROOM:", error);
        callback({ success: false, error: "Failed to create room" });
      }
    }
  );

  socket.on(
    SocketEvents.JOIN_ROOM,
    (data: { roomId: string; playerName: string }, callback) => {
      try {
        console.log("JOIN_ROOM event received:", {
          roomId: data.roomId,
          playerName: data.playerName,
          socketId: socket.id,
        });

        const roomId = data.roomId.toUpperCase();
        const room = rooms.get(roomId);

        if (!room) {
          console.log(`Room ${roomId} not found`);
          callback({ success: false, error: "Room not found" });
          return;
        }

        if (room.players.length >= 2) {
          console.log(`Room ${roomId} is full`);
          callback({ success: false, error: "Room is full" });
          return;
        }

        if (room.gameStarted || room.finished) {
          console.log(`Game in room ${roomId} already in progress`);
          callback({ success: false, error: "Game already in progress" });
          return;
        }

        const newPlayer: GamePlayer = {
          id: socket.id,
          name: data.playerName,
          connected: true,
          choice: null,
        };

        room.players.push(newPlayer);
        room.scores[socket.id] = 0;
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.playerName = data.playerName;

        console.log(
          `Room ${roomId}: ${data.playerName} joined (Total: ${room.players.length}/2)`
        );
        callback({ success: true, roomId, room });

        io.to(roomId).emit(SocketEvents.PLAYER_JOINED, {
          players: room.players,
          room,
        });

        // Game starts when 2 players join
        if (room.players.length === 2) {
          room.gameStarted = true;
          console.log(`Room ${roomId}: Game is starting!`);
          setTimeout(() => {
            io.to(roomId).emit(SocketEvents.GAME_STARTED, {
              room,
              message: "Game is starting!",
            });
            io.to(roomId).emit(SocketEvents.ROUND_STARTED, {
              round: room.currentRound,
              room,
            });
          }, 500);
        }
      } catch (error) {
        console.error("Error in JOIN_ROOM:", error);
        callback({ success: false, error: "Failed to join room" });
      }
    }
  );

  socket.on(
    SocketEvents.MAKE_CHOICE,
    (data: { choice: "rock" | "paper" | "scissors" }, callback) => {
      try {
        const roomId = socket.data.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          console.log("Room not found for MAKE_CHOICE");
          callback({ success: false, error: "Room not found" });
          return;
        }

        const player = room.players.find((p) => p.id === socket.id);
        if (player) {
          player.choice = data.choice;
          console.log(
            `Room ${roomId}: ${socket.data.playerName} chose ${data.choice}`
          );
        }

        callback({ success: true });

        // Check if both players have made their choices
        if (room.players.every((p) => p.choice !== null)) {
          console.log(
            `Room ${roomId}: Both players chose, processing round...`
          );
          processRound(io, roomId, room);
        }
      } catch (error) {
        console.error("Error in MAKE_CHOICE:", error);
        callback({ success: false, error: "Failed to submit choice" });
      }
    }
  );

  socket.on(SocketEvents.RESET_ROUND, () => {
    try {
      const roomId = socket.data.roomId;
      const room = rooms.get(roomId);

      if (!room) return;

      // Reset choices
      room.players.forEach((p) => {
        p.choice = null;
      });

      room.currentRound++;
      console.log(`Room ${roomId}: Moving to round ${room.currentRound}`);

      const player1Wins = room.scores[room.players[0].id] || 0;
      const player2Wins = room.scores[room.players[1].id] || 0;

      console.log(
        `Room ${roomId}: Scores after round - P1: ${player1Wins}, P2: ${player2Wins}`
      );

      if (player1Wins >= 2 || player2Wins >= 2) {
        room.finished = true;
        room.gameStarted = false;
        const winner = player1Wins >= 2 ? room.players[0] : room.players[1];
        console.log(`Room ${roomId}: Game finished! Winner: ${winner.name}`);
        io.to(roomId).emit(SocketEvents.GAME_ENDED, {
          room,
          winner,
          scores: room.scores,
        });
      } else {
        console.log(`Room ${roomId}: Starting next round ${room.currentRound}`);
        io.to(roomId).emit(SocketEvents.ROUND_STARTED, {
          round: room.currentRound,
          room,
        });
      }
    } catch (error) {
      console.error("Error in RESET_ROUND:", error);
    }
  });

  socket.on(SocketEvents.PLAY_AGAIN, () => {
    try {
      const roomId = socket.data.roomId;
      const room = rooms.get(roomId);

      if (!room) {
        console.log("Room not found for PLAY_AGAIN");
        return;
      }

      console.log(
        `Room ${roomId}: ${socket.data.playerName} wants to play again`
      );

      if (!playAgainRequests.has(roomId)) {
        playAgainRequests.set(roomId, new Set());
      }

      const requests = playAgainRequests.get(roomId)!;
      requests.add(socket.id);

      // Notify room that this player wants to play again
      io.to(roomId).emit(SocketEvents.WAITING_FOR_REMATCH, {
        playersReady: requests.size,
        totalPlayers: room.players.length,
        room,
      });

      console.log(
        `Room ${roomId}: ${requests.size}/${room.players.length} players want to play again`
      );

      // If both players want to play again, restart the game
      if (requests.size === room.players.length && room.players.length === 2) {
        console.log(`Room ${roomId}: Restarting game!`);

        // Reset room state
        room.currentRound = 1;
        room.gameStarted = true;
        room.finished = false;
        room.scores = {
          [room.players[0].id]: 0,
          [room.players[1].id]: 0,
        };
        room.roundResults = [];
        room.players.forEach((p) => {
          p.choice = null;
        });

        // Clear play again requests
        playAgainRequests.delete(roomId);

        // Notify players
        io.to(roomId).emit(SocketEvents.GAME_RESTARTED, { room });

        setTimeout(() => {
          io.to(roomId).emit(SocketEvents.ROUND_STARTED, {
            round: room.currentRound,
            room,
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error in PLAY_AGAIN:", error);
    }
  });

  socket.on(SocketEvents.LEAVE_ROOM, () => {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      console.log(`Room ${roomId}: ${socket.data.playerName} is leaving`);

      // Remove player from room
      room.players = room.players.filter((p) => p.id !== socket.id);

      // Notify other players
      io.to(roomId).emit(SocketEvents.PLAYER_LEFT, {
        playerName: socket.data.playerName,
        room,
      });

      // Leave the socket room
      socket.leave(roomId);
      socket.data.roomId = null;

      // Clean up empty rooms
      if (room.players.length === 0) {
        rooms.delete(roomId);
        playAgainRequests.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    } catch (error) {
      console.error("Error in LEAVE_ROOM:", error);
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) {
      console.log("Socket disconnected (no room):", socket.id);
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.connected = false;
      console.log(`Room ${roomId}: ${socket.data.playerName} disconnected`);
    }

    io.to(roomId).emit(SocketEvents.PLAYER_DISCONNECTED, {
      players: room.players,
      room,
    });

    // Clean up empty rooms after 60 seconds
    setTimeout(() => {
      if (!room.players.some((p) => p.connected)) {
        rooms.delete(roomId);
        playAgainRequests.delete(roomId);
        console.log(`Room ${roomId} deleted due to inactivity`);
      }
    }, 60000);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
