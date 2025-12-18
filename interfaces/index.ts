import type { GamePlayer, GameRoom } from "@/lib/socket-types";
import type { Socket } from "socket.io-client";
import type { Notification } from "@/lib/notification-store";
import type { RoundResult } from "../lib/socket-types";

export interface ConnectionStatusProps {
  players: GamePlayer[];
}

export interface GameChoicesProps {
  onChoose: (choice: GameChoice) => void;
  disabled?: boolean;
  selectedChoice?: GameChoice | null;
  isWaiting?: boolean;
}

export interface GameMenuProps {
  onPlayAgain: () => void;
  onDisconnect: () => void;
  disabled?: boolean;
  waitingForRematch?: boolean;
}

export interface GameResultsProps {
  room: GameRoom;
  scores: { [key: string]: number };
  onPlayAgain: () => void;
  onDisconnect: () => void;
  waitingForRematch?: boolean;
  rematchPlayersReady?: number;
}

export interface GameViewProps {
  socket: Socket;
  roomCode: string;
  isCreator: boolean;
  onGameEnd?: () => void;
}

export interface PlayerStatusProps {
  player: GamePlayer | null;
  isYou?: boolean;
  score?: number;
  choice?: string | null;
}

export interface RoundInfoProps {
  currentRound: number;
  maxRounds: number;
  gameStarted: boolean;
  finished: boolean;
}

export interface CreateRoomSectionProps {
  onRoomCreated: (playerName: string) => void;
  isLoading?: boolean;
  generatedCode?: string | null;
}

export interface JoinRoomSectionProps {
  onRoomJoined: (code: string) => void;
  isLoading?: boolean;
}

export interface LobbyViewProps {
  onGameStart: (code: string, isCreator: boolean) => void;
  isLoading?: boolean;
  generatedCode?: string | null;
}

export interface PlayerNameFormProps {
  onSubmit: (name: string) => void;
  disabled?: boolean;
}

export interface NotificationToastProps {
  notification: Notification;
}

export type GameChoice = "rock" | "paper" | "scissors";

export interface GameState {
  currentRound: number;
  maxRounds: number;
  scores: {
    [playerId: string]: number;
  };
  roundResults: RoundResult[];
  finished: boolean;
  winner?: string;
}
