"use client";

import { CHOICES } from "@/data";
import { GameChoicesProps } from "@/interfaces";
import { Zap } from "lucide-react";

export function GameChoices({
  onChoose,
  disabled,
  selectedChoice,
  isWaiting,
}: GameChoicesProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {isWaiting ? "Waiting for opponent..." : "Make your choice"}
      </p>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {CHOICES.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onChoose(choice.value)}
            disabled={disabled || isWaiting}
            className={`game-choice-btn transition-all ${
              selectedChoice === choice.value ? "active border-2" : ""
            }`}
          >
            <span className="text-4xl md:text-5xl">{choice.icon}</span>
            <span className="text-xs md:text-sm font-semibold text-center">
              {choice.label}
            </span>
          </button>
        ))}
      </div>

      {selectedChoice && isWaiting && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 animate-pulse" />
          Your choice is locked in
        </div>
      )}
    </div>
  );
}
