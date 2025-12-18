"use client";

import { ConnectionStatusProps } from "@/interfaces";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionStatus({ players }: ConnectionStatusProps) {
  if (players.length === 0) return null;

  const allConnected = players.every((p) => p.connected);
  const disconnectedPlayers = players.filter((p) => !p.connected);

  return (
    <div className="fixed top-20 left-4 right-4 mx-auto max-w-xl">
      {!allConnected && (
        <div className="flex items-center gap-2 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {disconnectedPlayers.map((p) => p.name).join(", ")} disconnected
            </p>
            <p className="text-xs opacity-90">
              Connection lost. Waiting to reconnect...
            </p>
          </div>
        </div>
      )}

      {allConnected && (
        <div className="flex items-center gap-2 bg-success text-success-foreground p-2 rounded-lg text-xs font-medium">
          <Wifi className="w-3 h-3 shrink-0" />
          All players connected
        </div>
      )}
    </div>
  );
}
