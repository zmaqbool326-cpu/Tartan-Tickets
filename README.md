# Tartan Tickets

A small Next.js prototype for **Story 1: Browse events** and the clarified **Story 4: Waitlist** homework scope in the requirements. It lists upcoming sample events with a date, location, price, and remaining-seat count. An event with no seats remaining shows **Join waitlist** instead of **Buy**.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

1. From this project folder, install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

   Check **Robotics Showcase** for the sold-out event with 0 seats.

   To check the waitlist, enter a made-up name in its **Demo name** field and choose **Join waitlist**. Repeat with a different name to add someone behind them. Re-enter either name (including different capitalization) to verify duplicate rejection. Choose **Simulate seat release** to offer a 30-minute hold to the first person; the in-app notification is shown when that person's demo name is selected in the form. Repeat with another waiter after the hold expires to verify FIFO promotion. With no other waiters, an expired hold returns the seat to available inventory.

To run the Story 1 tests, use `npm test`. To create a production build, use `npm run build`; to serve that build locally, use `npm start`.

## HW3 scope and simulations

- **Story 4: Waitlist** uses a made-up name entered in a text box as a demo identity; this is not sign-in or authentication.
- Joining is only allowed for sold-out events. The queue is first-in, first-out, and duplicate entries for the same event and demo identity are rejected.
- **Simulate seat release** releases one seat. The next person in line receives an in-app notification and a 30-minute hold. Claiming a ticket is outside this scope.
- If a hold expires, the seat is offered to the next waiting person; if there is nobody waiting, the seat returns to available inventory.
- There are no real payments, sign-in provider, database, or email service. The notification is in-app only.
- Waitlist and hold state is kept in server memory. It can reset on restart or deployment and is not reliable across multiple server instances.

## Prototype limitations

- The event list is sample data held in server-side source memory. There is no database; changes do not persist, and the list is not editable.
- **Buy** remains display-only and disabled; no checkout, order, or payment operation is implemented.
- There is no sign-in or university SSO, club administration, real ticketing, check-in, or real student attendee data. The prototype stores only the made-up demo names entered for its waitlist.
- This prototype does not connect to PostgreSQL, Stripe, external APIs, API keys, or AI/model services.
- The required display date is formatted in UTC.

## Specification inconsistencies and scope

The functional scope here is Story 1 and the explicitly clarified Story 4 scope for HW3 in `docs:/requirements.md`. Other stories and broader requirements are not implemented.

The supplied specs are not fully aligned:

- `docs:/TEST_SPEC.md` describes a different, much larger product (for example club registration/approval, officer roles, payments, tickets, and check-in), and its requirement identifiers do not match the numbered stories or criteria in `docs:/requirements.md`.
- `docs:/SECURITY_SPEC.md` refers to assumption IDs A1–A12, but no corresponding assumptions are present in `docs:/requirements.md`.
- The requirements describe deletion of personal data one year after an event, while the security spec requires attendee anonymization after 90 days.
- The requirements specify a four-ticket purchase cap, while the test spec's `test_ticket_limit_default_and_range` says 10 is accepted.
- The requirements name PostgreSQL and Stripe as the stack, but they are unrelated to the explicit Story 1 browsing scope. This prototype therefore uses neither.

These mismatches are recorded rather than reconciled by inventing behavior. Story 4's behavior follows the HW3 clarifications above where the supplied specifications are silent or inconsistent.
