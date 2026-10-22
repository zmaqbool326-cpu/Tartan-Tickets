const events = [
  {
    id: "autumn-jazz-night",
    title: "Autumn Jazz Night",
    club: "Campus Music Collective",
    startsAt: "2026-11-06T19:00:00.000Z",
    location: "McConomy Auditorium",
    priceCents: 1200,
    seatsRemaining: 24,
  },
  {
    id: "robotics-showcase",
    title: "Robotics Showcase",
    club: "Carnegie Robotics Club",
    startsAt: "2026-11-12T18:30:00.000Z",
    location: "Cohon University Center",
    priceCents: 0,
    seatsRemaining: 0,
  },
  {
    id: "winter-market",
    title: "Winter Makers Market",
    club: "Student Arts Council",
    startsAt: "2026-11-21T16:00:00.000Z",
    location: "Rangos Ballroom",
    priceCents: 500,
    seatsRemaining: 68,
  },
];

export function getUpcomingEvents(now = new Date()) {
  return events.filter((event) => new Date(event.startsAt) > now);
}

export function getEventActionLabel(event) {
  return event.seatsRemaining === 0 ? "Join waitlist" : "Buy";
}
