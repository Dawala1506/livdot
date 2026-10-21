"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LivEvent, EventStatus, ReadinessKey } from "@/lib/types";
import { initialEvents } from "@/lib/mock-events";
import { canTransition, getReadiness } from "@/lib/event-rules";

interface EventsContextValue {
  events: LivEvent[];
  hydrated: boolean;
  updateReadiness: (id: string, key: ReadinessKey, value: boolean) => void;
  transitionEvent: (id: string, target: EventStatus) => Promise<{ ok: boolean; message?: string }>;
  createEvent: (event: Omit<LivEvent, "id" | "status" | "readiness" | "ticketsSold" | "crewName" | "streamUrl">) => void;
}
export const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<LivEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("liv-dot-events-v1");
      setEvents(saved ? (JSON.parse(saved) as LivEvent[]) : initialEvents);
    } catch {
      setEvents(initialEvents);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("liv-dot-events-v1", JSON.stringify(events));
  }, [events, hydrated]);

  const updateReadiness = useCallback((id: string, key: ReadinessKey, value: boolean) => {
    setEvents(current => current.map(event => event.id === id ? { ...event, readiness: { ...event.readiness, [key]: value } } : event));
  }, []);

  const transitionEvent = useCallback(async (id: string, target: EventStatus): Promise<{ ok: boolean; message?: string }> => {
    const event = events.find(item => item.id === id);
    if (!event) return { ok: false, message: "Event not found." };
    if (!canTransition(event, target)) {
      const missing = getReadiness(event).missing.map(item => item.label.toLowerCase()).join(", ");
      return { ok: false, message: `Action blocked. Complete: ${missing}.` };
    }
    setEvents(current => current.map(item => item.id === id ? { ...item, isTransitioning: true } : item));
    await new Promise(resolve => setTimeout(resolve, 800));
    setEvents(current => current.map(item => item.id === id ? { ...item, status: target, isTransitioning: false } : item));
    return { ok: true };
  }, [events]);

  const createEvent = useCallback((input: Omit<LivEvent, "id" | "status" | "readiness" | "ticketsSold" | "crewName" | "streamUrl">) => {
    counter.current += 1;
    const event: LivEvent = { ...input, id: `evt-new-${counter.current}`, status: "Draft", readiness: { crewAssigned: false, ingestConfigured: false, ticketingConfigured: input.price >= 0 }, ticketsSold: 0, crewName: "", streamUrl: "" };
    setEvents(current => [event, ...current]);
  }, []);

  const value = useMemo(() => ({ events, hydrated, updateReadiness, transitionEvent, createEvent }), [events, hydrated, updateReadiness, transitionEvent, createEvent]);
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}
