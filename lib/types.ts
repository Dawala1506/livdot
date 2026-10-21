export type EventStatus = "Draft" | "Scheduled" | "Ready for Streaming" | "Live" | "Completed" | "Replay Available";
export type ReadinessKey = "crewAssigned" | "ingestConfigured" | "ticketingConfigured";
export interface EventReadiness {
  crewAssigned: boolean;
  ingestConfigured: boolean;
  ticketingConfigured: boolean;
}
export interface LivEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  image: string;
  status: EventStatus;
  readiness: EventReadiness;
  crewName: string;
  streamUrl: string;
  ticketsSold: number;
  capacity: number;
  isTransitioning?: boolean;
}
