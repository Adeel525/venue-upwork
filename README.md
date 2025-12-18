# Venue Seating Assignment

This project consists of a frontend React application for interactive seat selection and a backend Express.js API with caching and rate limiting.

## Architecture Choices & Trade-offs

### Frontend

**Rendering Strategy**: I chose SVG-based rendering over Canvas for the seating map. While Canvas can be faster for very large datasets, SVG provides better accessibility (native focus management, ARIA support) and easier event handling. For 15,000 seats, SVG with React.memo optimization provides smooth 60fps performance while maintaining full keyboard navigation and screen reader support.

**State Management**: Used React hooks (useState, useEffect) instead of a state management library. For this scope, local state with localStorage persistence is sufficient and keeps the bundle size small. The `useSeatSelection` hook encapsulates all selection logic, making it reusable and testable.

**Performance Optimizations**: 
- React.memo for SeatComponent to prevent unnecessary re-renders
- useMemo for flattening seat data structure
- useCallback for event handlers
- Debounced localStorage writes (implicit via useEffect)

**Accessibility Trade-off**: SVG circles with tabIndex and keyboard handlers provide good accessibility, though native HTML buttons would be more semantic. The SVG approach was chosen to maintain exact pixel positioning and visual consistency.

### Backend

**Caching Strategy**: Implemented a custom LRU cache instead of using a library (like `lru-cache`). This provides full control over TTL, statistics tracking, and cleanup intervals. The trade-off is more code to maintain, but it meets the exact requirements.

**Rate Limiting**: Custom implementation using Map-based tracking per IP. A library like `express-rate-limit` would be more robust in production, but the custom solution demonstrates understanding of the algorithm (sliding window with burst capacity).

**Queue System**: Simple array-based queue with async/await. For production, a library like Bull would provide better scalability, but the current implementation demonstrates promise deduplication and sequential processing with 200ms delay simulation.

**Concurrent Request Handling**: Promise deduplication ensures multiple simultaneous requests for the same user ID share a single database fetch, reducing load and ensuring cache consistency.

## Incomplete Features / TODOs

All core requirements are implemented. Optional stretch goals from the frontend requirements are not implemented:
- WebSocket for live seat-status updates
- Heat-map toggle by price tier
- "Find N adjacent seats" helper
- Pinch-zoom and pan for mobile
- Dark-mode toggle
- End-to-end tests

## Project Structure

```
venue-upwork/
├── frontend/     # React + TypeScript + Tailwind + ShadCN UI
├── backend/      # Express.js + TypeScript
└── assignment.md # Requirements document
```

## Frontend

### Setup

```bash
cd frontend
pnpm install
```

### Generate Venue Data

To generate the venue.json file with ~15,000 seats:

```bash
pnpm run generate-venue
```

### Development

```bash
pnpm dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns).

## Backend

### Setup

```bash
cd backend
pnpm install
```

### Development

```bash
pnpm dev
```

The backend API will be available at `http://localhost:3000`.

## API Endpoints

### Users

- `GET /users/:id` - Get user by ID (cached, with 200ms DB simulation delay)
- `POST /users` - Create a new user

### Cache

- `GET /cache-status` - Get cache statistics (size, hits, misses, average response time)
- `DELETE /cache` - Clear the cache

### Health

- `GET /health` - Health check endpoint

## Features

### Frontend

- Interactive seating map with ~15,000 seats
- Mouse and keyboard selection
- Maximum 8 seats selection
- Seat details display
- Live summary with subtotal
- LocalStorage persistence
- Full accessibility support (ARIA labels, keyboard navigation)
- Responsive design

### Backend

- LRU cache with 60-second TTL
- Automatic stale entry cleanup
- Rate limiting (10 requests/minute, 5 burst in 10 seconds)
- Queue-based DB simulation (200ms delay)
- Promise deduplication for concurrent requests
- Cache statistics tracking

