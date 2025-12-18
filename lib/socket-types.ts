export interface GameRoom {
  id: string;
  players: GamePlayer[];
  currentRound: number;
  maxRounds: number;
  gameStarted: boolean;
  finished: boolean;
  scores: {
    [playerId: string]: number;
  };
  roundResults: RoundResult[];
}

export interface GamePlayer {
  id: string;
  name: string;
  connected: boolean;
  choice?: "rock" | "paper" | "scissors" | null;
}

export interface RoundResult {
  round: number;
  player1: {
    id: string;
    choice: "rock" | "paper" | "scissors";
  };
  player2: {
    id: string;
    choice: "rock" | "paper" | "scissors";
  };
  winner: string | "draw"; // playerId or 'draw'
}

// Socket.io event types
export namespace SocketEvents {
  // Client -> Server
  export const CREATE_ROOM = "create_room";
  export const JOIN_ROOM = "join_room";
  export const MAKE_CHOICE = "make_choice";
  export const RESET_ROUND = "reset_round";
  export const LEAVE_ROOM = "leave_room";
  export const PLAY_AGAIN = "play_again";

  // Server -> Client
  export const ROOM_CREATED = "room_created";
  export const PLAYER_JOINED = "player_joined";
  export const GAME_STARTED = "game_started";
  export const ROUND_STARTED = "round_started";
  export const ROUND_ENDED = "round_ended";
  export const GAME_ENDED = "game_ended";
  export const PLAYER_DISCONNECTED = "player_disconnected";
  export const PLAYER_RECONNECTED = "player_reconnected";
  export const ERROR = "error";
  export const PLAYER_LEFT = "player_left";
  export const GAME_RESTARTED = "game_restarted";
  export const WAITING_FOR_REMATCH = "waiting_for_rematch";
}

export function getWinner(
  choice1: "rock" | "paper" | "scissors",
  choice2: "rock" | "paper" | "scissors"
): "draw" | 1 | 2 {
  if (choice1 === choice2) return "draw";

  if (choice1 === "rock") {
    return choice2 === "scissors" ? 1 : 2;
  }
  if (choice1 === "paper") {
    return choice2 === "rock" ? 1 : 2;
  }
  if (choice1 === "scissors") {
    return choice2 === "paper" ? 1 : 2;
  }

  return "draw";
}

export function processRound(io: any, roomId: string, room: GameRoom) {
  const [player1, player2] = room.players;

  const winner = getWinner(
    player1.choice as "rock" | "paper" | "scissors",
    player2.choice as "rock" | "paper" | "scissors"
  );

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
  };

  room.roundResults.push(result);

  if (winner === 1) {
    room.scores[player1.id] = (room.scores[player1.id] || 0) + 1;
    room.currentRound++; // Only increment round on non-draw
  } else if (winner === 2) {
    room.scores[player2.id] = (room.scores[player2.id] || 0) + 1;
    room.currentRound++; // Only increment round on non-draw
  }
  // If it's a draw, we don't increment the round - players replay

  console.log(
    `[Room ${roomId} Round ${room.currentRound}: ${
      winner === "draw"
        ? "Draw - replay this round"
        : winner === 1
        ? player1.name
        : player2.name
    } wins. Scores: ${room.scores[player1.id] || 0} - ${
      room.scores[player2.id] || 0
    }`
  );

  io.to(roomId).emit(SocketEvents.ROUND_ENDED, {
    result,
    scores: room.scores,
    room,
  });
}
