## Problem Statement

This assignment consists of two deliverables:

1. A **frontend application** built using **React + TypeScript + Tailwind + SchadCN** that renders an interactive seating map for an event using mock venue data. The application must support selecting seats via mouse and keyboard, enforce a maximum of 8 selected seats, show seat details, display a live summary with subtotal, persist selections after reload, meet basic accessibility requirements, and perform smoothly for large venues with approximately 15,000 seats.

2. A **backend API** built with **Express.js + TypeScript** that serves mock user data. The backend must implement an in-memory LRU cache with a 60-second TTL, track cache statistics, automatically remove stale entries, provide rate limiting (10 requests per minute with a 5 request burst in 10 seconds), simulate a database fetch with a 200ms delay using a queue, and ensure concurrent requests for the same user reuse a single fetch. Additional endpoints must allow clearing the cache, creating users, and viewing cache status.

Both applications must run using:
`pnpm install && pnpm dev`

---

## Frontend Requirements

The frontend must:

* Use React + TypeScript with strict mode enabled.
* Load mock seating data from `public/venue.json`.
* Render all seats using their exact `x` and `y` values.
* Allow seat selection using mouse click and keyboard interaction.
* Display seat details including:

  * section
  * row
  * seat id
  * price tier
  * status
* Limit selected seats to a maximum of 8.
* Display a live summary showing selected seats and subtotal.
* Persist selected seats after refresh using storage such as localStorage.
* Include the statuses: `available`, `reserved`, `sold`, `held`.
* Provide accessibility via `aria-label` and visible focus indicators.
* Support desktop and mobile viewports.
* Maintain smooth performance for large seating maps (~15,000 seats).

### Required Mock Data for Frontend

The file `public/venue.json` must exist and follow this structure:

```
{
  "venueId": "arena-01",
  "name": "Metropolis Arena",
  "map": { "width": 1024, "height": 768 },
  "sections": [
    {
      "id": "A",
      "label": "Lower Bowl A",
      "transform": { "x": 0, "y": 0, "scale": 1 },
      "rows": [
        {
          "index": 1,
          "seats": [
            {
              "id": "A-1-01",
              "col": 1,
              "x": 50,
              "y": 40,
              "priceTier": 1,
              "status": "available"
            },
            {
              "id": "A-1-02",
              "col": 2,
              "x": 80,
              "y": 40,
              "priceTier": 1,
              "status": "reserved"
            }
          ]
        }
      ]
    }
  ]
}
```

Required fields per seat:

* id
* col
* x
* y
* priceTier
* status

The application must demonstrate smooth performance for approximately 15,000 seats, meaning the dataset or its generation must support that scale.

---

## Backend Requirements

The backend must:

* Use Express.js + TypeScript in strict mode.
* Implement an in-memory LRU cache with:

  * 60-second TTL
  * tracking of hits, misses, and current size
  * automatic stale entry cleanup
* Simulate database access with a 200ms delay using a queue.
* Handle concurrent identical user requests via promise deduplication.
* Enforce rate limiting:

  * 10 requests per minute
  * burst of 5 requests in 10 seconds
  * return HTTP 429 on violation
* Implement endpoint: `GET /users/:id`

  * if cached → return immediately
  * if not cached → simulate DB fetch
  * if not found → return 404
* Implement additional endpoints:

  * `DELETE /cache` to clear cache
  * `GET /cache-status` to report size, hits, misses, and average response time
  * `POST /users` to create a new user and store/cache it

### Required Mock Data for Backend

The backend must include the following mock data:

```
const mockUsers = {
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
};
```

Minimum required mock users: 3
Required fields: id, name, email.

---

## Running Instructions

Frontend:

```
pnpm install
pnpm dev
```

Backend:

```
pnpm install
pnpm dev
```

No additional steps should be required.

---

## TODO (for incomplete required features)

This section must be updated to reflect actual incomplete tasks in code.

Example:

* Implement missing keyboard handling details
* Implement subtotal calculation using priceTier
* Finalize stale entry cleanup task for LRU cache
* Complete cache-status response fields

---

## Evaluation Criteria

Reviewers will evaluate:

* Correct seat rendering and selection
* Enforcement of 8 seat limit
* Keyboard and mouse support
* Persistence of selected seats
* Accessibility (`aria-label`, focus)
* Smooth performance for large venues
* LRU caching correctness and TTL handling
* Proper rate limiting
* Queue-based DB simulation and concurrent deduplication
* Correct endpoint behavior (`GET`, `POST`, `DELETE`)
* Proper handling of errors and status codes
* Clean TypeScript implementation
* Adherence to assignment requirements
