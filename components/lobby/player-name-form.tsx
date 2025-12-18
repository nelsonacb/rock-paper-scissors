"use client";

import type React from "react";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { User } from "lucide-react";
import { PlayerNameFormProps } from "@/interfaces";

export function PlayerNameForm({ onSubmit, disabled }: PlayerNameFormProps) {
  const [name, setName] = useState("");
  const gamePlayerName = useGameStore((state) => state.playerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      useGameStore.setState({ playerName: name.trim() });
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            id="playerName"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
            maxLength={20}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {name.length}/20 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={!name.trim() || disabled}
        className="btn-primary w-full"
      >
        {gamePlayerName ? "Proceed" : "Continue"}
      </button>
    </form>
  );
}
