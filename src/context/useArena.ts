import { useContext } from "react";
import { ArenaContext } from "@/context/ArenaContext";

export function useArena() {
  const context = useContext(ArenaContext);
  if (!context) throw new Error("useArena must be used within ArenaProvider");
  return context;
}
