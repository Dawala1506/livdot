import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import { LivEvent } from "@/lib/types";
import { allowedNextStatus, formatEventDate, formatNaira, getReadiness } from "@/lib/event-rules";
import { StatusBadge } from "@/components/StatusBadge";

export function EventCard({ event }: { event: LivEvent }) {
  const readiness = getReadiness(event);
  const next = allowedNextStatus(event.status);
  const isBlocked = (next === "Ready for Streaming" || next === "Live") && !readiness.ready;

  return <article className="event-card">
    <Link href={`/events/${event.id}`} className="event-image-wrap">
      <img className="event-image" src={event.image} alt={`${event.title} event cover`}/>
      <span className="image-category">{event.category}</span><span className="image-arrow"><ArrowUpRight size={17}/></span>
    </Link>
    <div className="event-card-body">
      <div className="event-card-title-row"><h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3><StatusBadge status={event.status}/></div>
      <div className="event-meta"><CalendarDays size={15}/><span>{formatEventDate(event.date)} <b>·</b> {event.time}</span></div>
      <div className="event-meta"><MapPin size={15}/><span className="truncate">{event.venue}</span></div>
      <div className="card-divider"/>
      <div className="event-card-bottom"><div><span className="muted-label">TICKET PRICE</span><strong className="ticket-price">{event.price === 0 ? "Free" : formatNaira(event.price)}</strong></div><div className="sold-count"><Ticket size={15}/><span>{event.ticketsSold} sold</span></div></div>
      <div className="readiness-mini">
        <div className="readiness-label">
          <span>Operational readiness</span>
          <strong className={readiness.ready ? "" : "readiness-incomplete"}>{readiness.completed}/{readiness.total}</strong>
        </div>
        <div className="progress-track"><span style={{width:`${readiness.percent}%`}}/></div>
        {isBlocked && <div className="card-blocked-hint"><AlertTriangle size={13}/><span>Blocked: {readiness.missing.map(x => x.label.toLowerCase()).join(", ")}</span></div>}
      </div>
      <Link href={`/events/${event.id}`} className="card-action">{event.status === "Live" ? "Monitor broadcast" : "Manage event"} <ArrowUpRight size={15}/></Link>
    </div>
  </article>;
}
