import { getSampleEvents } from "./events.js";

const HOLD_DURATION_MS = 30 * 60 * 1000;

export class WaitlistError extends Error {
  constructor(message) {
    super(message);
    this.name = "WaitlistError";
  }
}

export function createWaitlistService({ events, now = () => new Date() }) {
  const eventStates = new Map(
    events.map((event) => [
      event.id,
      {
        event: { ...event },
        seatsRemaining: event.seatsRemaining,
        releasableSeats: event.capacity - event.seatsRemaining,
        waitlist: [],
        joinedNames: new Set(),
        nextPosition: 1,
        notifications: [],
        activeHold: null,
      },
    ]),
  );

  function requireEvent(eventId) {
    const state = eventStates.get(eventId);
    if (!state) {
      throw new WaitlistError("Event not found.");
    }
    return state;
  }

  function offerSeat(state) {
    const nextPerson = state.waitlist.shift();
    if (!nextPerson) {
      state.seatsRemaining += 1;
      state.activeHold = null;
      return;
    }

    const expiresAt = new Date(now().getTime() + HOLD_DURATION_MS);
    state.activeHold = {
      demoName: nextPerson.demoName,
      expiresAt,
    };
    state.notifications.push({
      demoName: nextPerson.demoName,
      eventId: state.event.id,
      message: `A seat hold for ${state.event.title} is active for you for 30 minutes.`,
      createdAt: new Date(now()),
    });
  }

  function processExpiredHold(state) {
    if (state.activeHold && now().getTime() >= state.activeHold.expiresAt.getTime()) {
      offerSeat(state);
    }
  }

  function snapshot(eventId) {
    const state = requireEvent(eventId);
    processExpiredHold(state);
    return {
      event: { ...state.event },
      seatsRemaining: state.seatsRemaining,
      releasableSeats: state.releasableSeats,
      waitlist: state.waitlist.map((entry) => ({ ...entry })),
      activeHold: state.activeHold
        ? { ...state.activeHold, expiresAt: new Date(state.activeHold.expiresAt) }
        : null,
    };
  }

  return {
    addEvent(event) {
      if (eventStates.has(event.id)) {
        throw new WaitlistError("Event already exists.");
      }
      eventStates.set(event.id, {
        event: { ...event },
        seatsRemaining: event.seatsRemaining,
        releasableSeats: event.capacity - event.seatsRemaining,
        waitlist: [],
        joinedNames: new Set(),
        nextPosition: 1,
        notifications: [],
        activeHold: null,
      });
    },

    joinWaitlist({ eventId, demoName }) {
      const state = requireEvent(eventId);
      processExpiredHold(state);

      const name = typeof demoName === "string" ? demoName.trim() : "";
      if (!name) {
        throw new WaitlistError("Enter a demo name.");
      }
      if (state.seatsRemaining > 0) {
        throw new WaitlistError("This event is not sold out; waitlist sign-up is available only for sold-out events.");
      }
      const normalizedName = name.toLocaleLowerCase();
      if (state.joinedNames.has(normalizedName)) {
        throw new WaitlistError("This demo identity is already on the event waitlist.");
      }

      state.joinedNames.add(normalizedName);
      state.waitlist.push({ demoName: name, position: state.nextPosition });
      state.nextPosition += 1;
      return { ...state.waitlist.at(-1) };
    },

    simulateSeatRelease(eventId) {
      const state = requireEvent(eventId);
      processExpiredHold(state);
      if (state.releasableSeats <= 0) {
        throw new WaitlistError("There are no more seats to release for this event.");
      }
      if (state.activeHold) {
        throw new WaitlistError("A seat is already being held for this event.");
      }

      state.releasableSeats -= 1;
      offerSeat(state);
      return snapshot(eventId);
    },

    getEventState: snapshot,

    getWaitlist(eventId) {
      return snapshot(eventId).waitlist;
    },

    getNotifications(demoName) {
      const normalizedName = typeof demoName === "string" ? demoName.trim().toLocaleLowerCase() : "";
      const notifications = [];
      for (const state of eventStates.values()) {
        processExpiredHold(state);
        notifications.push(
          ...state.notifications
            .filter((notification) => notification.demoName.toLocaleLowerCase() === normalizedName)
            .map((notification) => ({ ...notification, createdAt: new Date(notification.createdAt) })),
        );
      }
      return notifications;
    },
  };
}

const waitlistService = createWaitlistService({
  events: getSampleEvents(),
});

export function getWaitlistService() {
  return waitlistService;
}
