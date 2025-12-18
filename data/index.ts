import { GameChoice } from "@/lib/game-logic";

export const CHOICES: { value: GameChoice; label: string; icon: string }[] = [
  { value: "rock", label: "Rock", icon: "✊" },
  { value: "paper", label: "Paper", icon: "✋" },
  { value: "scissors", label: "Scissors", icon: "✌️" },
];
