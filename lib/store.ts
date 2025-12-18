import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

interface GameStore {
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  gameState: "lobby" | "waiting" | "playing" | "finished";
  setGameState: (state: "lobby" | "waiting" | "playing" | "finished") => void;
  reset: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (isDark) => set({ isDark }),
    }),
    {
      name: "theme-storage",
    }
  )
);

export const useGameStore = create<GameStore>((set) => ({
  playerName: "",
  setPlayerName: (name) => set({ playerName: name }),
  roomCode: null,
  setRoomCode: (code) => set({ roomCode: code }),
  gameState: "lobby",
  setGameState: (state) => set({ gameState: state }),
  reset: () =>
    set({
      playerName: "",
      roomCode: null,
      gameState: "lobby",
    }),
}));
