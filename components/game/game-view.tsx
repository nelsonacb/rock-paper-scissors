"use client";

import { useEffect, useState } from "react";
import type { GameRoom, RoundResult } from "@/lib/socket-types";
import { SocketEvents } from "@/lib/socket-types";
import type { GameChoice } from "@/lib/game-logic";
import { GameChoices } from "./game-choices";
import { PlayerStatus } from "./player-status";
import { RoundInfo } from "./round-info";
import { GameResults } from "./game-results";
import { ConnectionStatus } from "./connection-status";
import { useGameStore } from "@/lib/store";
import { useNotifications } from "@/hooks/use-notifications";
import { GameMenu } from "./game-menu";
import { GameViewProps } from "@/interfaces";

export function GameView({
  socket,
  roomCode,
  isCreator,
  onGameEnd,
}: GameViewProps) {
  const playerName = useGameStore((state) => state.playerName);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<GameChoice | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [showWaitingAnimation, setShowWaitingAnimation] = useState(false);
  const [nextRoundReady, setNextRoundReady] = useState(false);
  const [waitingForRematch, setWaitingForRematch] = useState(false);
  const [rematchPlayersReady, setRematchPlayersReady] = useState(0);
  const notifications = useNotifications();

  useEffect(() => {
    socket.on(SocketEvents.GAME_STARTED, (data: { room: GameRoom }) => {
      console.log("Game started:", data);
      setRoom(data.room);
      setScores(data.room.scores);
      setSelectedChoice(null);
      setRoundResult(null);
      notifications.info("Game Started", "Let's play!");
    });

    socket.on(
      SocketEvents.ROUND_STARTED,
      (data: { room: GameRoom; round: number }) => {
        console.log("Round started:", data);
        setRoom(data.room);
        setSelectedChoice(null);
        setRoundResult(null);
        setShowWaitingAnimation(false);
        setNextRoundReady(false);
        notifications.info(`Round ${data.round}`, "Make your choice");
      }
    );

    socket.on(
      SocketEvents.PLAYER_JOINED,
      (data: { room: GameRoom; players: any[] }) => {
        console.log("Player joined:", data);
        setRoom(data.room);
        setScores(data.room.scores);
        if (data.players.length === 2) {
          notifications.success("Opponent Joined", "Game is starting!");
        }
      }
    );

    socket.on(
      SocketEvents.ROUND_ENDED,
      (data: {
        result: RoundResult;
        scores: { [key: string]: number };
        room: GameRoom;
      }) => {
        console.log("Round ended:", data);
        setRoundResult(data.result);
        setScores(data.scores);
        setRoom(data.room);
        setSelectedChoice(null);
        setShowWaitingAnimation(false);
        setNextRoundReady(true);

        // Show notification based on result
        const myPlayerId = socket.id;
        if (data.result.winner === "draw") {
          notifications.info("Draw!", "This round was a tie");
        } else if (data.result.winner === myPlayerId) {
          notifications.success("You Won This Round!", "Great job!");
        } else {
          notifications.error("Round Lost", "Try again next round");
        }
      }
    );

    socket.on(
      SocketEvents.GAME_ENDED,
      (data: {
        room: GameRoom;
        winner: any;
        scores: { [key: string]: number };
      }) => {
        console.log("Game ended:", data);
        setGameFinished(true);
        setRoom(data.room);
        setScores(data.scores);

        // Show final winner notification
        const myPlayerId = socket.id;
        if (data.winner.id === myPlayerId) {
          notifications.success(
            "You Won!",
            `Congratulations, ${data.winner.name}!`
          );
        } else {
          notifications.error("Game Over", `${data.winner.name} won the match`);
        }
      }
    );

    socket.on(
      SocketEvents.PLAYER_DISCONNECTED,
      (data: { room: GameRoom; players: any[] }) => {
        console.log("Player disconnected:", data);
        setRoom(data.room);
        notifications.warning(
          "Player Disconnected",
          "Waiting for reconnection..."
        );
      }
    );

    socket.on(
      SocketEvents.WAITING_FOR_REMATCH,
      (data: {
        playersReady: number;
        totalPlayers: number;
        room: GameRoom;
      }) => {
        console.log("Waiting for rematch:", data);
        setRematchPlayersReady(data.playersReady);
        if (data.playersReady < data.totalPlayers) {
          notifications.info(
            "Rematch",
            `Waiting for opponent (${data.playersReady}/${data.totalPlayers})`
          );
        }
      }
    );

    socket.on(SocketEvents.GAME_RESTARTED, (data: { room: GameRoom }) => {
      console.log("Game restarted:", data);
      setRoom(data.room);
      setScores(data.room.scores);
      setGameFinished(false);
      setWaitingForRematch(false);
      setRematchPlayersReady(0);
      setSelectedChoice(null);
      setRoundResult(null);
      setNextRoundReady(false);
      notifications.success("New Game", "Game restarted! Good luck!");
    });

    socket.on(
      SocketEvents.PLAYER_LEFT,
      (data: { playerName: string; room: GameRoom }) => {
        console.log("Player left:", data);
        notifications.warning(
          "Player Left",
          `${data.playerName} has left the game`
        );
        // Return to lobby after a delay
        setTimeout(() => {
          onGameEnd?.();
        }, 2000);
      }
    );

    return () => {
      socket.off(SocketEvents.GAME_STARTED);
      socket.off(SocketEvents.ROUND_STARTED);
      socket.off(SocketEvents.PLAYER_JOINED);
      socket.off(SocketEvents.ROUND_ENDED);
      socket.off(SocketEvents.GAME_ENDED);
      socket.off(SocketEvents.PLAYER_DISCONNECTED);
      socket.off(SocketEvents.WAITING_FOR_REMATCH);
      socket.off(SocketEvents.GAME_RESTARTED);
      socket.off(SocketEvents.PLAYER_LEFT);
    };
  }, [socket, notifications, onGameEnd]);

  const handleChoose = (choice: GameChoice) => {
    setSelectedChoice(choice);
    setShowWaitingAnimation(true);
    socket.emit(SocketEvents.MAKE_CHOICE, { choice }, (response: any) => {
      if (!response.success) {
        setSelectedChoice(null);
        setShowWaitingAnimation(false);
        notifications.error("Error", "Failed to submit choice");
      }
    });
  };

  const handleResetRound = () => {
    socket.emit(SocketEvents.RESET_ROUND);
  };

  const handlePlayAgain = () => {
    console.log("Requesting rematch...");
    setWaitingForRematch(true);
    socket.emit(SocketEvents.PLAY_AGAIN);
  };

  const handleDisconnect = () => {
    console.log("Player disconnecting...");
    socket.emit(SocketEvents.LEAVE_ROOM);
    onGameEnd?.();
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (gameFinished && room.finished) {
    return (
      <GameResults
        room={room}
        scores={scores}
        onPlayAgain={handlePlayAgain}
        onDisconnect={handleDisconnect}
        waitingForRematch={waitingForRematch}
        rematchPlayersReady={rematchPlayersReady}
      />
    );
  }

  const [player1, player2] = room.players;
  const isPlayer1 = socket.id === player1.id;
  const currentPlayer = isPlayer1 ? player1 : player2;
  const opponent = isPlayer1 ? player2 : player1;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <ConnectionStatus players={room.players} />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <GameMenu
          onPlayAgain={handlePlayAgain}
          onDisconnect={handleDisconnect}
          disabled={!gameFinished}
          waitingForRematch={waitingForRematch}
        />

        {/* Room info header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground">Room Code</p>
            <p className="text-2xl md:text-3xl font-mono font-bold text-primary">
              {roomCode}
            </p>
          </div>
          <RoundInfo
            currentRound={room.currentRound}
            maxRounds={room.maxRounds}
            gameStarted={room.gameStarted}
            finished={room.finished}
          />
        </div>

        {/* Players section - responsive grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div>
            <PlayerStatus
              player={currentPlayer}
              isYou={true}
              score={scores[currentPlayer.id]}
              choice={currentPlayer.choice}
            />
          </div>
          <div>
            <PlayerStatus
              player={opponent}
              isYou={false}
              score={scores[opponent.id]}
              choice={opponent.choice}
            />
          </div>
        </div>

        {room.gameStarted && !gameFinished && (
          <div className="card-base mb-8">
            <GameChoices
              onChoose={handleChoose}
              disabled={
                !room.gameStarted || gameFinished || selectedChoice !== null
              }
              selectedChoice={selectedChoice}
              isWaiting={showWaitingAnimation && selectedChoice !== null}
            />
          </div>
        )}

        {/* Round result - show after both players have chosen */}
        {roundResult && nextRoundReady && (
          <div className="card-base mb-8 text-center space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl md:text-3xl font-bold">
              Round {roundResult.round} Result
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {player1.name}
                </p>
                <p className="text-5xl md:text-6xl">
                  {roundResult.player1.choice === "rock" && "✊"}
                  {roundResult.player1.choice === "paper" && "✋"}
                  {roundResult.player1.choice === "scissors" && "✌️"}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  Result
                </p>
                <p className="text-xl md:text-2xl font-bold px-4 py-2 bg-muted rounded-lg">
                  {roundResult.winner === "draw"
                    ? "Draw 🤝"
                    : roundResult.winner === player1.id
                    ? `${player1.name} Wins 🎉`
                    : `${player2.name} Wins 🎉`}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {player2.name}
                </p>
                <p className="text-5xl md:text-6xl">
                  {roundResult.player2.choice === "rock" && "✊"}
                  {roundResult.player2.choice === "paper" && "✋"}
                  {roundResult.player2.choice === "scissors" && "✌️"}
                </p>
              </div>
            </div>

            {/* Check if game is finished */}
            {scores[player1.id] >= 2 || scores[player2.id] >= 2 ? (
              <div className="pt-4">
                <button
                  onClick={() => setGameFinished(true)}
                  className="btn-primary"
                >
                  See Final Results
                </button>
              </div>
            ) : (
              <button onClick={handleResetRound} className="btn-primary mt-4">
                Next Round
              </button>
            )}
          </div>
        )}

        {/* Waiting state message */}
        {!room.gameStarted && room.players.length < 2 && (
          <div className="card-base text-center py-12">
            <div className="space-y-4">
              <p className="text-lg font-semibold">Waiting for Opponent</p>
              <p className="text-sm text-muted-foreground">
                Share the room code: {roomCode}
              </p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
