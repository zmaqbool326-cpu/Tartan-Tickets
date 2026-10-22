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

## Security spec audit

This table assesses the current homework prototype against every item in `docs:/SECURITY_SPEC.md`. “Partly” means a limited aspect is present, not that the whole production requirement is met. Demo names are not authentication. The prototype is not production-ready.

| Requirement | Status | Evidence |
|---|---|---|
| SEC-1 — CMU SSO and no password storage | Partly | SSO is not implemented; users enter made-up demo names. No password handling or storage is present. See `src/app/page.js` and `src/lib/waitlist.js`. |
| SEC-2 — Expire inactive sessions after 8 hours | Not at all | No sign-in or session mechanism exists. |
| SEC-3 — HTTPS-only pages and APIs, with HSTS | Not at all | The app is documented for local HTTP; there is no HTTPS redirect or HSTS configuration in the app. |
| SEC-4 — Check roles and club membership on every server request | Not at all | Server actions accept event and demo-name form fields and call waitlist operations without an authenticated user, role, or club-membership check. See `src/app/actions.js`. |
| SEC-5 — Deny and log unauthorized club-resource access | Not at all | No club authorization or access-attempt logging exists; event waitlist names are rendered on the public page. See `src/app/page.js`. |
| SEC-6 — Return not found for another student's ticket | Not at all | There are no real student accounts or tickets. |
| SEC-7 — Use Stripe Checkout so card data never reaches the app | Partly | There is no card-entry path, but Stripe Checkout is not implemented. The Buy button is disabled. See `src/app/page.js`. |
| SEC-8 — Calculate charges on the server and ignore browser amounts | Not at all | No checkout or charge calculation exists. |
| SEC-9 — Verify Stripe webhook signatures | Not at all | No Stripe integration or webhook handler exists. |
| SEC-10 — Process each Stripe event ID at most once | Not at all | No Stripe event processing exists. |
| SEC-11 — Store Stripe keys in a secrets manager; use live keys only in production | Not at all | There is no Stripe integration or secrets-manager configuration. |
| SEC-12 — Require president and admin approval for Stripe account changes | Not at all | No connected Stripe account or approval workflow exists. |
| SEC-13 — Use random 128-bit-minimum QR tokens with server lookup | Not at all | No tickets or QR-token handling exists. |
| SEC-14 — Ensure concurrent check-in happens exactly once | Not at all | No ticket scanning or check-in exists. |
| SEC-15 — Pause repeated invalid scans and notify officers | Not at all | There are no scans, authenticated accounts, or officer notifications. |
| SEC-16 — Rate-limit per-account event checkouts | Not at all | There is no checkout or authenticated account. |
| SEC-17 — Restrict purchase records to the specified fields | Not at all | No purchase records exist; waitlist entries instead hold demo names in memory. See `src/lib/waitlist.js`. |
| SEC-18 — Remove attendee names and emails 90 days after an event | Not at all | There is no attendee-retention process. In-memory waitlist data may reset on restart or deployment, but this is not scheduled 90-day deletion. |
| SEC-19 — Restrict attendee exports to hosting officers and log exports | Not at all | No attendee export, officer role, or export logging exists. |
| SEC-20 — Render officer-entered text as plain text | Fully | Dynamic event and waitlist text is rendered using ordinary JSX text expressions, not raw HTML insertion. See `src/app/page.js`. |
| SEC-21 — Audit role changes, refunds, cancellations, account changes, and exports | Not at all | No such administrative/payment workflows or audit log exist. |
| SEC-22 — Keep append-only, admin-readable audit logs for one year | Not at all | No audit-log store, access control, or retention mechanism exists. |
| SEC-23 — Reject demo names longer than 80 characters on the server before changing waitlist state | Fully | The server trims and rejects blank/non-string values and names over 80 characters before looking up event state or processing expired holds. Tests accept 80 characters, reject 81 without adding a queue entry, and verify an invalid name does not trigger expired-hold processing. Demo names remain unauthenticated; this validates input only and does not establish identity. |

**Recommendation — close SEC-3.** Configure the production hosting edge to redirect HTTP to HTTPS and send an HSTS response header, then verify both behaviors on the deployed host. This does not require sign-in, a database, or payments. The current local development server remains HTTP, so do not treat SEC-3 as met until that production configuration and verification exist.
