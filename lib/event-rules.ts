import { EventStatus, LivEvent, ReadinessKey } from "./types";

export const readinessItems: Array<{ key: ReadinessKey; label: string; detail: string }> = [
  { key: "crewAssigned", label: "Production crew assigned", detail: "A crew member or production partner must be assigned." },
  { key: "ingestConfigured", label: "Streaming ingest configured", detail: "Add the stream ingest destination before broadcast." },
  { key: "ticketingConfigured", label: "Ticket pricing configured", detail: "Set a ticket price, including free entry at ₦0." },
];

export function getReadiness(event: LivEvent) {
  const items = readinessItems.map(item => ({ ...item, complete: Boolean(event.readiness[item.key]) }));
  const completed = items.filter(item => item.complete).length;
  return { items, completed, total: items.length, ready: completed === items.length, percent: Math.round(completed / items.length * 100), missing: items.filter(item => !item.complete) };
}

export function allowedNextStatus(status: EventStatus): EventStatus | null {
  const transitions: Partial<Record<EventStatus, EventStatus>> = {
    Draft: "Scheduled",
    Scheduled: "Ready for Streaming",
    "Ready for Streaming": "Live",
    Live: "Completed",
    Completed: "Replay Available",
  };
  return transitions[status] ?? null;
}

export function allowedPrevStatus(status: EventStatus): EventStatus | null {
  const rollbacks: Partial<Record<EventStatus, EventStatus>> = {
    Live: "Scheduled",
  };
  return rollbacks[status] ?? null;
}

export function canTransition(event: LivEvent, target: EventStatus) {
  if (target === "Ready for Streaming" || target === "Live") return getReadiness(event).ready;
  return true;
}

export function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
