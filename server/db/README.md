# Database Layer

MongoDB access layer (`mongo.js`) — the `patients` collection is the single
source of truth for patient state; agents append their outputs to it.

Falls back to an in-memory store (with a loud warning) if Atlas is
unreachable, so the demo keeps working.

`seed.js` inserts fully-processed demo patients (`npm run seed`).
