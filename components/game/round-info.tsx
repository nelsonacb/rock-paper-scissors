"use client";

import { RoundInfoProps } from "@/interfaces";

export function RoundInfo({
  currentRound,
  maxRounds,
  gameStarted,
  finished,
}: RoundInfoProps) {
  return (
    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
      <div>
        <p className="text-xs text-muted-foreground">Round</p>
        <p className="text-2xl font-bold">
          {currentRound} / {maxRounds}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground">Status</p>
        <p
          className={`text-sm font-bold ${
            finished
              ? "text-destructive"
              : gameStarted
              ? "text-success"
              : "text-muted-foreground"
          }`}
        >
          {finished ? "Finished" : gameStarted ? "Playing" : "Waiting"}
        </p>
      </div>
    </div>
  );
}
