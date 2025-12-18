"use client";

import { useState } from "react";
import { CreateRoomSection } from "./create-room-section";
import { JoinRoomSection } from "./join-room-section";
import { LobbyViewProps } from "@/interfaces";

export function LobbyView({
  onGameStart,
  isLoading,
  generatedCode,
}: LobbyViewProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const handleRoomCreated = (playerName: string) => {
    console.log("Create room button clicked with playerName:", playerName);
    onGameStart(playerName, true);
  };

  const handleRoomJoined = (code: string) => {
    console.log("Room join initiated with code:", code);
    onGameStart(code, false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-card text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Hero section */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-4xl md:text-5xl mb-4">
            <span>✊</span>
            <span className="text-muted-foreground">/</span>
            <span>✋</span>
            <span className="text-muted-foreground">/</span>
            <span>✌️</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Rock Paper Scissors
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Play with a friend in real-time. First to win 2 rounds wins the
            game!
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-8 border-b border-border rounded-t-lg bg-card p-1 w-full">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-3 px-4 font-medium rounded-t-lg transition-all ${
              activeTab === "create"
                ? "bg-primary text-primary-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-3 px-4 font-medium rounded-t-lg transition-all ${
              activeTab === "join"
                ? "bg-primary text-primary-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Join Room
          </button>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "create" ? (
            <CreateRoomSection
              onRoomCreated={handleRoomCreated}
              isLoading={isLoading}
              generatedCode={generatedCode}
            />
          ) : (
            <JoinRoomSection
              onRoomJoined={handleRoomJoined}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center space-y-4 text-sm text-muted-foreground">
          <p>
            Best-of-3 format: First player to win 2 rounds wins the entire match
          </p>
          <p className="text-xs">
            Ties don't count - keep playing until someone wins!
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block">✊ Beats ✌️</span>
            <span className="inline-block">•</span>
            <span className="inline-block">✌️ Beats ✋</span>
            <span className="inline-block">•</span>
            <span className="inline-block">✋ Beats ✊</span>
          </div>
        </div>
      </div>
    </div>
  );
}
