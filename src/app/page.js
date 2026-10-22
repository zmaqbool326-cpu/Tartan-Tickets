import { getEventActionLabel, getUpcomingEvents } from "../lib/events.js";

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

export default function HomePage() {
  const events = getUpcomingEvents();

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
              const soldOut = event.seatsRemaining === 0;
              const actionLabel = getEventActionLabel(event);

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
                            {event.seatsRemaining}
                          </dd>
                        </div>
                      </div>
                    </dl>
                    <button className="event-action" type="button" disabled>
                      {actionLabel}
                      <span aria-hidden="true">{soldOut ? "+" : "↗"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="prototype-notice" aria-label="Prototype limitation">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p>
          <strong>Browsing preview</strong>
          <span>Purchases and waitlist sign-ups aren’t available in this prototype.</span>
        </p>
      </aside>

      <footer className="site-footer">
        <span>Tartan Tickets</span>
        <span>A student events prototype</span>
      </footer>
    </main>
  );
}
