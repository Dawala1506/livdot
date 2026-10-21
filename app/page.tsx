"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Video,
  Radio,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventStatus } from "@/lib/types";
import { formatEventDate, getReadiness } from "@/lib/event-rules";
import { StatusBadge } from "@/components/StatusBadge";
import { EventCard } from "@/components/event/EventCard";
import { CreateEventModal } from "@/components/event/CreateEventModal";

const filters: Array<"All events" | EventStatus> = [
  "All events",
  "Draft",
  "Scheduled",
  "Ready for Streaming",
  "Live",
  "Completed",
  "Replay Available",
];

export default function HomePage() {
  const { events } = useEvents();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All events");
  const [showCreate, setShowCreate] = useState(false);
  const [sortNewest, setSortNewest] = useState(false);

  const filtered = useMemo(
    () =>
      events
        .filter((e) => filter === "All events" || e.status === filter)
        .filter((e) =>
          `${e.title} ${e.category} ${e.venue}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sortNewest
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date),
        ),
    [events, filter, query, sortNewest],
  );

  const readyCount = events.filter((e) => getReadiness(e).ready).length;
  const liveCount = events.filter((e) => e.status === "Live").length;
  const tickets = events.reduce((sum, e) => sum + e.ticketsSold, 0);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Radio size={21} />
          </span>
          <span>
            LIV<span className="brand-dot">.</span>DOT
          </span>
        </Link>
        <Link className="nav-item active" href="/">
          <span className="nav-icon">▦</span> Overview
        </Link>
        <a className="nav-item" href="#events">
          <CalendarDays size={18} /> Events{" "}
          <span className="nav-count">{events.length}</span>
        </a>
        <a className="nav-item" href="#events">
          <Ticket size={18} /> Ticket sales
        </a>
        <a className="nav-item" href="#operations">
          <Video size={18} /> Broadcasts
        </a>
        <div className="sidebar-bottom">
          <div className="profile">
            <div className="profile-avatar">JD</div>
            <div>
              <strong>Jordan Davis</strong>
              <span>Event host</span>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => alert("You're all caught up.")}
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">JD</div>
          </div>
        </header>
        <div className="page-content">
          <div className="welcome-row">
            <div>
              <h1>
                Your events, <span>in the spotlight.</span>
              </h1>
              <p className="subheading">
                Plan your next moment. We’ll help you get every detail
                broadcast-ready.
              </p>
            </div>
            <button
              className="button button-primary"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={18} /> Create event
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total events</span>
                <span className="stat-icon purple">
                  <CalendarDays size={18} />
                </span>
              </div>
              <div className="stat-number">
                {events.length.toString().padStart(2, "0")}
              </div>
              <div className="stat-foot">
                <span className="stat-dot purple-dot" /> Across your workspace
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Ready to go live</span>
                <span className="stat-icon green">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <div className="stat-number">
                {readyCount.toString().padStart(2, "0")}
              </div>
              <div className="stat-foot">
                <span className="stat-dot green-dot" /> All checks passed
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Currently live</span>
                <span className="stat-icon red">
                  <Radio size={18} />
                </span>
              </div>
              <div className="stat-number">
                {liveCount.toString().padStart(2, "0")}
              </div>
              <div className="stat-foot">
                <span className="stat-dot red-dot" /> Broadcasting now
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Tickets sold</span>
                <span className="stat-icon amber">
                  <Ticket size={18} />
                </span>
              </div>
              <div className="stat-number">{tickets.toLocaleString()}</div>
              <div className="stat-foot">
                <span className="stat-dot amber-dot" /> Across all events
              </div>
            </div>
          </div>

          <section className="events-section" id="events">
            <div className="section-heading">
              <div>
                <h2>
                  Your events{" "}
                  <span className="count-chip">{events.length}</span>
                </h2>
                <p>Everything you’re hosting, all in one place.</p>
              </div>
              <button
                className="button button-outline"
                onClick={() => setSortNewest((v) => !v)}
              >
                <ArrowDownUp size={16} />{" "}
                {sortNewest ? "Date: latest first" : "Date: soonest first"}
              </button>
            </div>
            <div className="filter-bar">
              <div className="search-box">
                <Search size={17} />
                <input
                  aria-label="Search events"
                  placeholder="Search events..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd>⌘ K</kbd>
              </div>
              <div className="filter-list">
                <SlidersHorizontal size={16} />
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`filter-chip ${filter === f ? "selected" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length ? (
              <div className="events-grid">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={24} />
                </div>
                <h3>No events found</h3>
                <p>Try another search or select a different status filter.</p>
                <button
                  className="button button-outline"
                  onClick={() => {
                    setQuery("");
                    setFilter("All events");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <section className="operations-strip" id="operations">
            <div className="operations-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong>Your production workspace is in good shape</strong>
              <p>
                Keep an eye on readiness checks before your next event goes
                live.
              </p>
            </div>
            <Link href="/events/evt-001" className="text-link">
              View event readiness <ArrowRight size={15} />
            </Link>
          </section>
          <footer className="footer">
            <span>© 2026 LIV DOT</span>
            <span>
              Made for moments that matter{" "}
              <span className="footer-heart">♥</span>
            </span>
            <span>v1.0.0 · Host Studio</span>
          </footer>
        </div>
      </section>
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
