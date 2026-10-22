import assert from "node:assert/strict";
import test from "node:test";
import { getEventActionLabel, getUpcomingEvents } from "../src/lib/events.js";

const now = new Date("2026-10-22T12:00:00.000Z");

test("Story 1: upcoming events include date, location, price, and seats remaining", () => {
  const events = getUpcomingEvents(now);

  assert.ok(events.length > 0, "sample data includes upcoming events");
  for (const event of events) {
    assert.ok(event.startsAt, `${event.title} has a date`);
    assert.ok(event.location, `${event.title} has a location`);
    assert.equal(typeof event.priceCents, "number", `${event.title} has a price`);
    assert.equal(typeof event.seatsRemaining, "number", `${event.title} has a seat count`);
  }
});

test("Story 1: sold-out events show Join waitlist instead of Buy", () => {
  const soldOutEvent = getUpcomingEvents(now).find((event) => event.seatsRemaining === 0);

  assert.ok(soldOutEvent, "sample data includes a sold-out event");
  assert.equal(getEventActionLabel(soldOutEvent), "Join waitlist");
});

test("Story 1: events with seats available show Buy", () => {
  const availableEvent = getUpcomingEvents(now).find((event) => event.seatsRemaining > 0);

  assert.ok(availableEvent, "sample data includes an available event");
  assert.equal(getEventActionLabel(availableEvent), "Buy");
});

test("Story 1: past events are not listed as upcoming", () => {
  const events = getUpcomingEvents(now);

  assert.ok(events.every((event) => new Date(event.startsAt) > now));
});
