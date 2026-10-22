import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const event = {
  id: "sold-out-event",
  title: "Sold Out Event",
  capacity: 1,
  seatsRemaining: 0,
};

async function createFixture() {
  const { createWaitlistService } = await import("../src/lib/waitlist.js");
  let currentTime = new Date("2026-10-22T12:00:00.000Z");
  const service = createWaitlistService({
    events: [{ ...event }],
    now: () => new Date(currentTime),
  });

  return {
    service,
    setTime: (time) => {
      currentTime = new Date(time);
    },
  };
}

test("Story 4: attendee enters a made-up name as a demo identity", async () => {
  const { service } = await createFixture();

  service.joinWaitlist({ eventId: event.id, demoName: "Tartan Test User" });

  assert.deepEqual(service.getWaitlist(event.id).map((entry) => entry.demoName), [
    "Tartan Test User",
  ]);
});

test("Story 4: only sold-out events accept waitlist entries", async () => {
  const { service } = await createFixture();
  service.addEvent({
    id: "available-event",
    title: "Available Event",
    capacity: 5,
    seatsRemaining: 2,
  });

  assert.throws(
    () => service.joinWaitlist({ eventId: "available-event", demoName: "Avery" }),
    /sold out/i,
  );
  assert.deepEqual(service.getWaitlist("available-event"), []);
});

test("Story 4: waitlist entries are served first-in, first-out", async () => {
  const { service } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "First" });
  service.joinWaitlist({ eventId: event.id, demoName: "Second" });
  service.joinWaitlist({ eventId: event.id, demoName: "Third" });

  service.simulateSeatRelease(event.id);

  assert.equal(service.getEventState(event.id).activeHold.demoName, "First");
  assert.deepEqual(
    service.getWaitlist(event.id).map((entry) => entry.demoName),
    ["Second", "Third"],
  );
});

test("Story 4: a demo identity cannot join the same event twice", async () => {
  const { service } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "Avery" });

  assert.throws(
    () => service.joinWaitlist({ eventId: event.id, demoName: "Avery" }),
    /already/i,
  );
  assert.equal(service.getWaitlist(event.id).length, 1);
});

test("Story 4: simulated seat release notifies the next person in-app", async () => {
  const { service } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "Jordan" });

  service.simulateSeatRelease(event.id);

  const [notification] = service.getNotifications("Jordan");
  assert.equal(notification.eventId, event.id);
  assert.match(notification.message, /seat.*hold/i);
});

test("Story 4: a released seat is held for 30 minutes", async () => {
  const { service, setTime } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "Jordan" });

  service.simulateSeatRelease(event.id);
  assert.equal(
    service.getEventState(event.id).activeHold.expiresAt.toISOString(),
    "2026-10-22T12:30:00.000Z",
  );

  setTime("2026-10-22T12:29:59.999Z");
  assert.equal(service.getEventState(event.id).activeHold.demoName, "Jordan");
});

test("Story 4: an expired hold offers the seat to the next person waiting", async () => {
  const { service, setTime } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "First" });
  service.joinWaitlist({ eventId: event.id, demoName: "Second" });
  service.simulateSeatRelease(event.id);

  setTime("2026-10-22T12:30:00.000Z");

  assert.equal(service.getEventState(event.id).activeHold.demoName, "Second");
  assert.deepEqual(
    service.getNotifications("Second").map((notification) => notification.eventId),
    [event.id],
  );
});

test("Story 4: an expired hold returns the seat to inventory when nobody is waiting", async () => {
  const { service, setTime } = await createFixture();
  service.joinWaitlist({ eventId: event.id, demoName: "Only Person" });
  service.simulateSeatRelease(event.id);

  setTime("2026-10-22T12:30:00.000Z");

  assert.equal(service.getEventState(event.id).activeHold, null);
  assert.equal(service.getEventState(event.id).seatsRemaining, 1);
});

test("Story 4: the page exposes a labeled name field and seat-release simulation control", async () => {
  const pageSource = await readFile(new URL("../src/app/page.js", import.meta.url), "utf8");

  assert.match(pageSource, /Demo name/i);
  assert.match(pageSource, /type=["']text["']/i);
  assert.match(pageSource, /Simulate seat release/);
});
