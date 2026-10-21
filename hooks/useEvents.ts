"use client";
import { useContext } from "react";
import { EventsContext } from "@/store/events-context";
export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) throw new Error("useEvents must be used inside EventsProvider");
  return context;
}
