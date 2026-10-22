import { getEventActionLabel, getUpcomingEvents } from "../lib/events.js";
import { joinWaitlistAction, simulateSeatReleaseAction } from "./actions.js";
import { getWaitlistService } from "../lib/waitlist.js";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function HomePage({ searchParams }) {
  const events = getUpcomingEvents();
  const params = await searchParams;
  const identity = typeof params?.identity === "string" ? params.identity : "";
  const notice = typeof params?.notice === "string" ? params.notice : "";
  const waitlistService = getWaitlistService();
  const notifications = identity ? waitlistService.getNotifications(identity) : [];

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Tartan Tickets home">
          <span className="wordmark-mark" aria-hidden="true">T</span>
          <span>Tartan Tickets</span>
        </a>
        <span className="header-note">Campus events, together</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">DISCOVER YOUR NEXT DAY OUT</p>
        <h1 id="page-title">Find your people.<br />Find your event.</h1>
        <p className="intro-copy">
          See what student clubs are putting on around campus.
        </p>
      </section>

      <section className="events-section" aria-labelledby="events-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ON CAMPUS</p>
            <h2 id="events-heading">Upcoming events</h2>
          </div>
          <span className="event-count">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">No upcoming events yet.</div>
        ) : (
          <div className="event-grid">
            {events.map((event) => {
              const state = waitlistService.getEventState(event.id);
              const currentEvent = { ...event, seatsRemaining: state.seatsRemaining };
              const soldOut = state.seatsRemaining === 0;
              const actionLabel = getEventActionLabel(currentEvent);

              return (
                <article className="event-card" key={event.id}>
                  <div className={`event-art event-art-${event.id}`} aria-hidden="true">
                    <span className="art-orbit art-orbit-one" />
                    <span className="art-orbit art-orbit-two" />
                    <span className="art-label">CMU · {event.club.split(" ")[0]}</span>
                    {soldOut && <span className="sold-out-badge">SOLD OUT</span>}
                  </div>
                  <div className="event-content">
                    <p className="club-name">{event.club}</p>
                    <h3>{event.title}</h3>
                    <dl className="event-details">
                      <div>
                        <dt>Date</dt>
                        <dd>{dateFormatter.format(new Date(event.startsAt))}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{event.location}</dd>
                      </div>
                      <div className="detail-pair">
                        <div>
                          <dt>Price</dt>
                          <dd>{priceFormatter.format(event.priceCents / 100)}</dd>
                        </div>
                        <div>
                          <dt>Seats remaining</dt>
                          <dd className={soldOut ? "sold-out-text" : ""}>
                            {state.seatsRemaining}
                          </dd>
                        </div>
                      </div>
                    </dl>
                    {soldOut ? (
                      <form className="waitlist-form" action={joinWaitlistAction}>
                        <label htmlFor={`demo-name-${event.id}`}>Demo name</label>
                        <input
                          id={`demo-name-${event.id}`}
                          name="demoName"
                          type="text"
                          autoComplete="off"
                          maxLength={60}
                          defaultValue={identity}
                          required
                        />
                        <input type="hidden" name="eventId" value={event.id} />
                        <button className="event-action" type="submit">
                          {actionLabel}
                          <span aria-hidden="true">+</span>
                        </button>
                      </form>
                    ) : (
                      <button className="event-action" type="button" disabled>
                        {actionLabel}
                        <span aria-hidden="true">↗</span>
                      </button>
                    )}
                    {state.waitlist.length > 0 && (
                      <div className="waitlist-status">
                        <strong>Waitlist</strong>
                        <ol>
                          {state.waitlist.map((entry) => (
                            <li key={`${event.id}-${entry.demoName}`}>{entry.demoName}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {state.activeHold && (
                      <p className="hold-status" role="status">
                        Seat held for {state.activeHold.demoName} until{" "}
                        {state.activeHold.expiresAt.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })} UTC.
                      </p>
                    )}
                    {state.releasableSeats > 0 && !state.activeHold && (
                      <form className="release-form" action={simulateSeatReleaseAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="demoName" value={identity} />
                        <button className="simulate-release" type="submit">
                          Simulate seat release
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {(notice || notifications.length > 0) && (
        <section className="waitlist-feedback" aria-label="Waitlist updates" aria-live="polite">
          {notice && <p role="status">{notice}</p>}
          {notifications.map((notification, index) => (
            <p role="status" key={`${notification.eventId}-${index}`}>{notification.message}</p>
          ))}
        </section>
      )}

      <form className="notification-lookup" method="get">
        <label htmlFor="notification-identity">Check notifications for a demo name</label>
        <input
          id="notification-identity"
          name="identity"
          type="text"
          autoComplete="off"
          maxLength={60}
          defaultValue={identity}
          required
        />
        <button type="submit">Check notifications</button>
      </form>

      <aside className="prototype-notice" aria-label="Prototype limitation">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p>
          <strong>Homework prototype</strong>
          <span>Waitlist is simulated in server memory. Purchases are unavailable.</span>
        </p>
      </aside>

      <footer className="site-footer">
        <span>Tartan Tickets</span>
        <span>A student events prototype</span>
      </footer>
    </main>
  );
}
