import { EventStatus } from "@/lib/types";
const styles: Record<EventStatus, string> = {
  Draft: "status-draft",
  Scheduled: "status-scheduled",
  "Ready for Streaming": "status-ready",
  Live: "status-live",
  Completed: "status-completed",
  "Replay Available": "status-replay",
};
export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={`status-badge ${styles[status]}`}><span className="status-dot"/>{status}</span>;
}
