import type { RoundResult } from "./socket-types"

export type GameChoice = "rock" | "paper" | "scissors"

export interface GameState {
  currentRound: number
  maxRounds: number
  scores: {
    [playerId: string]: number
  }
  roundResults: RoundResult[]
  finished: boolean
  winner?: string
}

export function determineWinner(choice1: GameChoice, choice2: GameChoice): "draw" | "player1" | "player2" {
  if (choice1 === choice2) return "draw"

  const winConditions: Record<GameChoice, GameChoice> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  }

  return winConditions[choice1] === choice2 ? "player1" : "player2"
}

export function hasPlayerWon(scores: { [playerId: string]: number }): boolean {
  return Object.values(scores).some((score) => score >= 2)
}

export function getGameWinner(
  scores: { [playerId: string]: string | number },
  players: Array<{ id: string; name: string }>,
): { id: string; name: string } | null {
  const playersArray = Object.entries(scores).map(([id, score]) => ({
    id,
    score: score as number,
  }))

  const maxScore = Math.max(...playersArray.map((p) => p.score))

  if (maxScore < 2) return null

  const winnerId = playersArray.find((p) => p.score === maxScore)?.id
  return players.find((p) => p.id === winnerId) || null
}

export function getRoundWinner(player1Choice: GameChoice, player2Choice: GameChoice): "draw" | 1 | 2 {
  const result = determineWinner(player1Choice, player2Choice)

  if (result === "draw") return "draw"
  if (result === "player1") return 1
  return 2
}

export function getChoiceEmoji(choice: GameChoice): string {
  const emojiMap: Record<GameChoice, string> = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️",
  }
  return emojiMap[choice]
}

export function getRoundMessage(
  winner: "draw" | "player1" | "player2",
  player1Name: string,
  player2Name: string,
): string {
  if (winner === "draw") {
    return "It's a Draw!"
  }
  return winner === "player1" ? `${player1Name} wins!` : `${player2Name} wins!`
}
