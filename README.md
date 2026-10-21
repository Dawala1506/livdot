# LIV DOT — Host Event Dashboard

A Next.js App Router interface for managing live, ticketed events. Built as part of the LIV DOT frontend assessment.

---

## Requirements

- Node.js 20+
- npm

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build:

```bash
npm run build
npm run start
```

---

## Project Structure

```
app/
  page.tsx                  # Overview dashboard (event grid, stats, search, filters)
  layout.tsx                # Root layout with EventsProvider
  globals.css               # All styles
  events/
    [eventId]/page.tsx      # Event detail / control room

components/
  StatusBadge.tsx           # Lifecycle status pill
  event/
    EventCard.tsx           # Grid card with readiness indicator and blocked hint
    CreateEventModal.tsx    # New event form

lib/
  types.ts                  # Domain types: LivEvent, EventStatus, ReadinessKey
  mock-events.ts            # Seed data (9 events across all lifecycle stages)
  event-rules.ts            # Pure functions: getReadiness, allowedNextStatus,
                            #   allowedPrevStatus, canTransition, formatters

store/
  events-context.tsx        # React context — shared event state + actions

hooks/
  useEvents.ts              # Typed hook for consuming EventsContext
```

---

## Deliverable 2 — State Modeling

### UI state structure

All event state lives in a single `LivEvent[]` array inside `EventsContext`. Each event carries:

- `status` — the current lifecycle stage (one of six values)
- `readiness` — three boolean flags (`crewAssigned`, `ingestConfigured`, `ticketingConfigured`)
- `isTransitioning` — a transient flag set during the async simulated API call

Readiness is **derived on read** via `getReadiness(event)` in `lib/event-rules.ts` rather than stored as a pre-computed summary. This means it is always consistent with the underlying flags and cannot become stale.

### State transitions

Transitions are handled by `transitionEvent` in the context. The flow is:

1. Validate the target status is reachable from the current one (`allowedNextStatus`)
2. Check readiness guards — transitions to `Ready for Streaming` or `Live` require all three readiness checks to pass (`canTransition`)
3. If valid, set `isTransitioning: true` on the event immediately (optimistic loading state)
4. Simulate an async API call with a short delay
5. Commit the new status and clear `isTransitioning`

If validation fails, the function returns `{ ok: false, message }` without mutating state. The UI surfaces this as an error notice.

Stream failure is handled as a **reverse transition**: `allowedPrevStatus` maps `Live → Scheduled`, allowing a host to roll back when a broadcast fails and reconfigure before retrying.

### Blocked and incomplete states

An action is blocked when the next step requires readiness checks that have not been satisfied. The interface communicates this at two levels:

- **Grid level** — `EventCard` shows an inline hint listing the specific missing requirements so a host can identify blocked events without opening them
- **Detail level** — the advance button is disabled and an `inline-blocked` callout appears directly beside it explaining what is preventing progress; the readiness panel below shows per-check status with a `blocked-banner` summary

The button never silently does nothing — it is either enabled, visibly disabled with a reason, or showing a loading state.

---

## Deliverable 3 — Implementation Notes

### Component structure

Components are split into two layers:

- `components/ui/` — stateless primitives with no domain knowledge (`StatusBadge`, `Button`, `Card`)
- `components/event/` — domain components that consume event types and rules (`EventCard`, `CreateEventModal`)

Pages (`app/`) are thin: they read from `useEvents`, derive display values using pure functions from `lib/event-rules.ts`, and delegate rendering to the components above.

### State management

State is managed with React Context + `useState`. This was chosen over a heavier solution (Redux, Zustand) because:

- The data model is a single flat list of events
- All mutations are local and synchronous in shape (async is simulated, not real)
- No cross-cutting concerns like caching, pagination, or optimistic rollback are required at this scale

State is persisted to `localStorage` so changes survive page refreshes. Hydration is handled carefully: the server renders with an empty array, and the client populates from storage (or falls back to seed data) after mount. This avoids server/client HTML mismatches.

### Assumptions and tradeoffs

- **No real backend.** All API calls are simulated with a fixed delay. In production, `transitionEvent` and `updateReadiness` would be replaced with `fetch` calls, and the context would reconcile server responses.
- **Readiness flags are toggled directly.** In a real system, crew assignment and ingest configuration would be set through dedicated flows (assigning a crew member from a roster, configuring an RTMP destination). The toggles here simulate the backend confirming those actions.
- **Single host workspace.** The interface assumes one authenticated host. Multi-tenancy, permissions, and role-based access are out of scope.
- **No optimistic rollback on failure.** The async simulation always succeeds. A production implementation would revert `isTransitioning` and restore the previous status if the API call failed.
- **`localStorage` as the persistence layer.** Suitable for a demo. A real product would use server-side storage with the UI as a projection of server state.
