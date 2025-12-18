import { io, type Socket } from "socket.io-client";
import { SocketEvents } from "./socket-types";

let socket: Socket | null = null;

export function initializeSocketClient(): Socket {
  if (socket && socket.connected) {
    console.log("Socket already connected:", socket.id);
    return socket;
  }

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : window.location.origin
      : "");

  console.log("Initializing Socket.io client with URL:", socketUrl);

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket.io Client Connected with ID:", socket!.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.io Connection Error:", error);
  });

  socket.on("disconnect", () => {
    console.log("Socket.io Client Disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket.io Error:", error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("Disconnecting socket:", socket.id);
    socket.disconnect();
    socket = null;
  }
}

// Event handlers
export function onRoomCreated(
  callback: (data: { roomId: string; players: any[] }) => void
) {
  const s = getSocket();
  if (s) s.on(SocketEvents.ROOM_CREATED, callback);
}

export function onPlayerJoined(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.PLAYER_JOINED, callback);
}

export function onGameStarted(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.GAME_STARTED, callback);
}

export function onRoundStarted(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.ROUND_STARTED, callback);
}

export function onRoundEnded(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.ROUND_ENDED, callback);
}

export function onGameEnded(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.GAME_ENDED, callback);
}

export function onPlayerDisconnected(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.PLAYER_DISCONNECTED, callback);
}

export function onPlayerReconnected(callback: (data: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.PLAYER_RECONNECTED, callback);
}

export function onError(callback: (error: any) => void) {
  const s = getSocket();
  if (s) s.on(SocketEvents.ERROR, callback);
}
