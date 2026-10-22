# Tartan Tickets

A small Next.js prototype for **Story 1: Browse events** in the requirements. It lists upcoming sample events with a date, location, price, and remaining-seat count. An event with no seats remaining shows **Join waitlist** instead of **Buy**.

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

   Check the **Autumn Jazz Night** card for an available event with **Buy** and remaining seats. Check **Robotics Showcase** for a sold-out event with 0 seats and **Join waitlist**. The buttons are intentionally disabled.

To run the Story 1 tests, use `npm test`. To create a production build, use `npm run build`; to serve that build locally, use `npm start`.

## Prototype limitations

- The event list is sample data held in server-side source memory. There is no database; changes do not persist, and the list is not editable.
- **Buy** and **Join waitlist** are display-only, disabled buttons. No checkout, order, payment, or waitlist operation is implemented.
- There is no sign-in, university SSO, club administration, ticketing, check-in, or attendee data.
- This prototype does not connect to PostgreSQL, Stripe, external APIs, API keys, or AI/model services.
- The required display date is formatted in UTC.

## Specification inconsistencies and scope

The functional scope here is only the two acceptance criteria under **Story 1** in `docs:/requirements.md`. Other stories and broader requirements are not implemented.

The supplied specs are not fully aligned:

- `docs:/TEST_SPEC.md` describes a different, much larger product (for example club registration/approval, officer roles, payments, tickets, and check-in), and its requirement identifiers do not match the numbered stories or criteria in `docs:/requirements.md`.
- `docs:/SECURITY_SPEC.md` refers to assumption IDs A1–A12, but no corresponding assumptions are present in `docs:/requirements.md`.
- The requirements describe deletion of personal data one year after an event, while the security spec requires attendee anonymization after 90 days.
- The requirements specify a four-ticket purchase cap, while the test spec's `test_ticket_limit_default_and_range` says 10 is accepted.
- The requirements name PostgreSQL and Stripe as the stack, but they are unrelated to the explicit Story 1 browsing scope. This prototype therefore uses neither.

These mismatches are recorded rather than reconciled by inventing behavior. Only Story 1's stated browsing criteria are implemented and tested here.
