"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Circle, Clock3, Loader2, MapPin, Radio, ShieldAlert, Ticket, Video } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventStatus, ReadinessKey } from "@/lib/types";
import { allowedNextStatus, allowedPrevStatus, formatEventDate, formatNaira, getReadiness } from "@/lib/event-rules";
import { StatusBadge } from "@/components/StatusBadge";

const lifecycle: EventStatus[] = ["Draft", "Scheduled", "Ready for Streaming", "Live", "Completed", "Replay Available"];

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const { events, updateReadiness, transitionEvent } = useEvents();
  const event = events.find(e => e.id === params.eventId);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");
  const [advancing, setAdvancing] = useState(false);

  if (!event) return (
    <main className="detail-shell">
      <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to events</Link>
      <div className="empty-state">
        <h2>Event not found</h2>
        <p>This event may have been removed or is not in this workspace.</p>
        <Link href="/" className="button button-primary">Return to overview</Link>
      </div>
    </main>
  );

  const readiness = getReadiness(event);
  const next = allowedNextStatus(event.status);
  const prev = allowedPrevStatus(event.status);
  const nextNeedsChecks = next === "Ready for Streaming" || next === "Live";
  const blocked = Boolean(nextNeedsChecks && !readiness.ready);
  const eventId = event.id;

  async function advance() {
    if (!next || advancing) return;
    setAdvancing(true);
    setNotice("");
    const result = await transitionEvent(eventId, next);
    setNoticeType(result.ok ? "success" : "error");
    setNotice(result.ok ? `Status updated to "${next}".` : result.message || "Unable to update event.");
    setAdvancing(false);
  }

  async function reportStreamFailure() {
    if (!prev || advancing) return;
    setAdvancing(true);
    setNotice("");
    const result = await transitionEvent(eventId, prev);
    setNoticeType(result.ok ? "error" : "error");
    setNotice(result.ok ? "Stream failure reported. Event rolled back to Scheduled." : result.message || "Unable to report failure.");
    setAdvancing(false);
  }

  return (
    <main className="detail-shell">
      <header className="topbar detail-topbar">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> All events</Link>
        <div className="top-actions">
          <span className="system-pill"><span className="online-dot" /> All systems operational</span>
          <div className="top-avatar">JD</div>
        </div>
      </header>
      <div className="detail-content">
        <div className="detail-title-row">
          <div>
            <div className="eyebrow">EVENT CONTROL ROOM</div>
            <h1>{event.title}</h1>
            <p className="subheading">Manage event setup, readiness and broadcast operations.</p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="detail-hero">
          <img src={event.image} alt={`${event.title} cover`} />
          <div className="detail-hero-overlay" />
          <div className="detail-hero-info">
            <span className="image-category">{event.category}</span>
            <h2>{event.title}</h2>
            <div className="hero-meta">
              <span><CalendarDays size={15} />{formatEventDate(event.date)} · {event.time}</span>
              <span><MapPin size={15} />{event.venue}</span>
            </div>
          </div>
        </div>

        <div className="detail-columns">
          <div className="detail-main-column">

            {/* Lifecycle panel */}
            <section className="panel lifecycle-panel">
              <div className="panel-heading">
                <div><h2>Event lifecycle</h2><p>Progress from planning to replay, one step at a time.</p></div>
                <span className="small-label">CURRENT STATE</span>
              </div>
              <div className="lifecycle-track">
                {lifecycle.map((s, i) => {
                  const active = lifecycle.indexOf(event.status);
                  const complete = i < active;
                  return (
                    <div className={`lifecycle-step ${s === event.status ? "current" : ""} ${complete ? "complete" : ""}`} key={s}>
                      <div className="lifecycle-node">{complete ? <Check size={14} /> : i + 1}</div>
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>

              {notice && <div className={`notice ${noticeType}`}><span>{noticeType === "success" ? "✓" : "!"}</span>{notice}</div>}

              <div className="transition-box">
                <div>
                  <strong>{next ? `Next step: ${next}` : "You've reached the final lifecycle stage"}</strong>
                  <p>
                    {blocked
                      ? `Blocked: ${readiness.missing.map(x => x.label.toLowerCase()).join(", ")} ${readiness.missing.length === 1 ? "is" : "are"} incomplete.`
                      : next
                        ? "Review the requirements below, then move the event forward when ready."
                        : "Replay is available for your audience."}
                  </p>
                  {blocked && (
                    <div className="inline-blocked">
                      <AlertTriangle size={14} />
                      <span>Complete all readiness checks before this action becomes available.</span>
                    </div>
                  )}
                </div>
                <button
                  className="button button-primary"
                  onClick={advance}
                  disabled={!next || blocked || advancing || event.isTransitioning}
                >
                  {advancing || event.isTransitioning
                    ? <><Loader2 size={16} className="spin" /> Updating…</>
                    : next ? <>{`Move to ${next}`} <ArrowRight size={16} /></> : "Lifecycle complete"}
                </button>
              </div>

              {/* Stream failure rollback — only shown when Live */}
              {event.status === "Live" && (
                <div className="stream-failure-box">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>Stream failure?</strong>
                    <p>If the broadcast has failed, roll the event back to Scheduled to reconfigure and retry.</p>
                  </div>
                  <button className="button button-danger" onClick={reportStreamFailure} disabled={advancing}>
                    Report stream failure
                  </button>
                </div>
              )}
            </section>

            {/* Readiness panel */}
            <section className="panel readiness-panel">
              <div className="panel-heading">
                <div><h2>Operational readiness</h2><p>All checks must pass before broadcast can begin.</p></div>
                <div className={`readiness-score ${readiness.ready ? "score-ready" : "score-pending"}`}>{readiness.completed}/{readiness.total} complete</div>
              </div>
              <div className="large-progress"><span style={{ width: `${readiness.percent}%` }} /></div>
              <div className="readiness-checks">
                {readiness.items.map(item => (
                  <div className={`readiness-check ${item.complete ? "check-complete" : "check-incomplete"}`} key={item.key}>
                    <div className="check-symbol">{item.complete ? <CheckCircle2 size={20} /> : <Circle size={20} />}</div>
                    <div className="check-copy">
                      <strong>{item.label}</strong>
                      <p>{item.complete ? "Requirement satisfied." : item.detail}</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={item.complete} onChange={e => updateReadiness(event.id, item.key as ReadinessKey, e.target.checked)} />
                      <span />
                    </label>
                  </div>
                ))}
              </div>
              {!readiness.ready && (
                <div className="blocked-banner">
                  <ShieldAlert size={18} />
                  <div>
                    <strong>Broadcast action blocked</strong>
                    <p>Complete the outstanding checks above. Toggles simulate backend confirmation in this mock environment.</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="detail-side-column">
            {/* Summary */}
            <section className="panel summary-panel">
              <div className="panel-heading"><div><h2>Event summary</h2><p>Key information at a glance.</p></div></div>
              <div className="summary-item"><span className="summary-icon"><CalendarDays size={17} /></span><div><span>Date & time</span><strong>{formatEventDate(event.date)} · {event.time}</strong></div></div>
              <div className="summary-item"><span className="summary-icon"><MapPin size={17} /></span><div><span>Location</span><strong>{event.venue}</strong></div></div>
              <div className="summary-item"><span className="summary-icon"><Ticket size={17} /></span><div><span>Ticket price</span><strong>{event.price === 0 ? "Free" : formatNaira(event.price)}</strong></div></div>
              <div className="summary-item"><span className="summary-icon"><Ticket size={17} /></span><div><span>Tickets sold</span><strong>{event.ticketsSold} <small>/ {event.capacity} capacity</small></strong></div></div>
            </section>

            {/* Crew */}
            <section className="panel crew-panel">
              <div className="panel-heading"><div><h2>Production crew</h2><p>Technical broadcast support.</p></div><Video size={18} className="panel-heading-icon" /></div>
              <div className="crew-card">
                <div className="crew-avatar">{event.crewName ? event.crewName.slice(0, 1) : "?"}</div>
                <div><strong>{event.crewName || "No crew assigned"}</strong><span>{event.crewName ? "Production partner" : "Assignment required"}</span></div>
              </div>
              <p className="panel-hint">{event.readiness.crewAssigned ? "Your production partner is confirmed for this event." : "A production crew must be assigned before going live."}</p>
              <button className="button button-outline full-width" onClick={() => updateReadiness(event.id, "crewAssigned", !event.readiness.crewAssigned)}>
                {event.readiness.crewAssigned ? "Mark crew unassigned" : "Simulate crew assigned"}
              </button>
            </section>

            {/* Stream */}
            <section className="panel stream-panel">
              <div className="panel-heading"><div><h2>Stream configuration</h2><p>Ingest destination status.</p></div><Radio size={18} className="panel-heading-icon" /></div>
              <div className="stream-status">
                <span className={`stream-status-dot ${event.readiness.ingestConfigured ? "is-configured" : ""}`} />
                <strong>{event.readiness.ingestConfigured ? "Ingest configured" : "Not configured"}</strong>
              </div>
              <div className="stream-url">{event.readiness.ingestConfigured ? (event.streamUrl || "rtmps://live.livdot.example/ingest") : "Configure an ingest URL to continue."}</div>
              <button className="button button-outline full-width" onClick={() => updateReadiness(event.id, "ingestConfigured", !event.readiness.ingestConfigured)}>
                {event.readiness.ingestConfigured ? "Simulate ingest failure" : "Simulate ingest configured"}
              </button>
            </section>

            {/* Ticketing */}
            <section className="panel ticketing-panel">
              <div className="panel-heading"><div><h2>Ticket pricing</h2><p>Pricing must be confirmed before broadcast.</p></div><Ticket size={18} className="panel-heading-icon" /></div>
              <div className="stream-status">
                <span className={`stream-status-dot ${event.readiness.ticketingConfigured ? "is-configured" : ""}`} />
                <strong>{event.readiness.ticketingConfigured ? `Pricing set — ${event.price === 0 ? "Free" : formatNaira(event.price)}` : "Pricing not configured"}</strong>
              </div>
              <p className="panel-hint">{event.readiness.ticketingConfigured ? "Ticket pricing is confirmed. Viewers can purchase access." : "Set a ticket price (including ₦0 for free events) before going live."}</p>
              <button className="button button-outline full-width" onClick={() => updateReadiness(event.id, "ticketingConfigured", !event.readiness.ticketingConfigured)}>
                {event.readiness.ticketingConfigured ? "Simulate pricing removed" : "Simulate pricing configured"}
              </button>
            </section>

            <div className="info-callout">
              <Clock3 size={17} />
              <p><strong>Mock environment</strong><br />Toggles simulate backend updates. In production, these actions would call the API and display server-confirmed state.</p>
            </div>
          </aside>
        </div>
        <footer className="footer"><span>© 2026 LIV DOT</span><span>Event control room</span><Link href="/">Back to overview ↑</Link></footer>
      </div>
    </main>
  );
}
