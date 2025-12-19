# Venue Seating System - Implementation Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Venue Data Generation](#venue-data-generation)
4. [Backend API Implementation](#backend-api-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Key Features](#key-features)
7. [Data Flow](#data-flow)

---

## Project Overview

This is a full-stack venue seating management system that allows users to:
- View an interactive seating map with 15,000+ seats
- Select up to 8 seats at a time
- See real-time seat availability and assignments
- Track pricing by tier
- Manage user data with caching and rate limiting

The system consists of:
- **Backend**: Express.js API with TypeScript
- **Frontend**: React + TypeScript with Vite
- **Data**: Generated venue JSON and mock user/assignment data

---

## Architecture

### System Components

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│   Backend API   │
│   (React)       │◀────────│   (Express)     │
└─────────────────┘         └─────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  venue.json     │         │  Mock Data      │
│  (Static)       │         │  (Users/Seats)  │
└─────────────────┘         └─────────────────┘
```

### Technology Stack

**Backend:**
- Express.js - Web framework
- TypeScript - Type safety
- LRU Cache - In-memory caching
- Custom DB Queue - Request deduplication and queuing

**Frontend:**
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- SVG - Interactive seating map

---

## Venue Data Generation

### Overview

The venue data is generated using a Node.js script located at `frontend/scripts/generate-venue.ts`. This script creates a comprehensive JSON file containing all seat information.

### How `venue.json` is Created

#### 1. Script Execution

Run the generation script:
```bash
cd frontend
pnpm run generate-venue
```

This executes `scripts/generate-venue.ts` which generates the venue data.

#### 2. Generation Process

The script follows these steps:

**Step 1: Configuration**
```typescript
const TARGET_SEATS = 15000;
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const STATUSES: SeatStatus[] = ['available', 'reserved', 'sold', 'held'];
const PRICE_TIERS = [1, 2, 3, 4, 5] as const;
```

**Step 2: Status Distribution**
- 60% available
- 20% reserved
- 15% sold
- 5% held

**Step 3: Section Generation**
For each of the 16 sections (A-P):
- Calculate seats per section: `Math.ceil(15000 / 16) ≈ 938 seats`
- Generate 30-50 rows per section (randomized)
- Calculate seats per row based on section size

**Step 4: Seat Creation**
For each seat:
```typescript
{
  id: `${sectionId}-${rowIndex}-${col}` // e.g., "A-1-02"
  col: number,                          // Column number
  x: number,                            // X coordinate for SVG
  y: number,                            // Y coordinate for SVG
  priceTier: 1-5,                       // Random price tier
  status: 'available' | 'reserved' | 'sold' | 'held'
}
```

**Step 5: Coordinate Calculation**
- X position: `50 + (col - 1) * 30 + (sectionIndex % 4) * 300`
- Y position: `40 + (rowIndex - 1) * 25 + Math.floor(sectionIndex / 4) * 600`

This arranges sections in a 4x4 grid layout.

**Step 6: Output**
The generated venue is written to `frontend/public/venue.json`:
```json
{
  "venueId": "arena-01",
  "name": "Metropolis Arena",
  "map": {
    "width": 2048,
    "height": 1536
  },
  "sections": [
    {
      "id": "A",
      "label": "Section A",
      "transform": { "x": 0, "y": 0, "scale": 1 },
      "rows": [
        {
          "index": 1,
          "seats": [...]
        }
      ]
    }
  ]
}
```

### Venue Data Structure

```typescript
interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

interface Section {
  id: string;
  label: string;
  transform: { x: number; y: number; scale: number };
  rows: Row[];
}

interface Row {
  index: number;
  seats: Seat[];
}

interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: 1 | 2 | 3 | 4 | 5;
  status: 'available' | 'reserved' | 'sold' | 'held';
}
```

---

## Backend API Implementation

### API Structure

The backend is organized into modular routes and services:

```
backend/src/
├── server.ts              # Entry point
├── app.ts                 # Express app configuration
├── routes/
│   ├── users.ts          # User endpoints
│   ├── seats.ts          # Seat assignment endpoints
│   └── cache.ts          # Cache management endpoints
├── services/
│   └── dbQueue.ts        # Database queue with deduplication
├── cache/
│   └── LRUCache.ts       # LRU cache implementation
├── middleware/
│   └── rateLimiter.ts    # Rate limiting middleware
└── data/
    ├── mockUsers.ts      # Mock user data
    └── mockSeatAssignments.ts  # Mock seat assignments
```

### API Endpoints

#### 1. User Endpoints (`/users`)

**GET `/users/:id`**
- Fetches user by ID
- Uses LRU cache (60-second TTL)
- Implements request deduplication via DBQueue
- Response: `{ id, name, email }`

**Flow:**
```
Request → Check Cache → If miss → DBQueue → Mock DB → Cache → Response
```

**POST `/users`**
- Creates a new user
- Body: `{ name: string, email: string }`
- Response: Created user object
- Automatically caches the new user

#### 2. Seat Endpoints (`/seats`)

**GET `/seats/assignments`**
- Returns all seat assignments
- Response: Array of `SeatAssignment` objects

**GET `/seats/:seatId/assignment`**
- Returns assignment for a specific seat
- Response: `SeatAssignment` or 404

**SeatAssignment Structure:**
```typescript
{
  seatId: string;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'reserved' | 'sold' | 'held';
  reservedAt?: string;
}
```

#### 3. Cache Endpoints (`/cache`)

**GET `/cache`**
- Returns cache statistics
- Response:
```typescript
{
  size: number;              // Current cache size
  hits: number;              // Cache hits
  misses: number;            // Cache misses
  averageResponseTime: number; // Average DB response time
}
```

**DELETE `/cache`**
- Clears the entire cache
- Response: `{ message: 'Cache cleared successfully' }`

### Key Backend Features

#### 1. LRU Cache Implementation

Located in `backend/src/cache/LRUCache.ts`:

**Features:**
- Time-based expiration (TTL)
- Least Recently Used eviction
- Automatic cleanup every 10 seconds
- Hit/miss tracking

**Usage:**
```typescript
const cache = new LRUCache<User>(60); // 60-second TTL
cache.set('user:1', user);
const user = cache.get('user:1');
```

#### 2. Database Queue with Deduplication

Located in `backend/src/services/dbQueue.ts`:

**Features:**
- Request queuing to prevent database overload
- Promise deduplication (same user ID requests share the same promise)
- 200ms simulated database delay
- Response time tracking

**How it works:**
```typescript
// Multiple requests for user ID 1 will share the same promise
const promise1 = dbQueue.fetchUser(1);
const promise2 = dbQueue.fetchUser(1); // Reuses promise1
```

#### 3. Rate Limiting

Located in `backend/src/middleware/rateLimiter.ts`:

**Limits:**
- 10 requests per minute (per IP)
- 5 requests per 10 seconds (burst limit)

**Implementation:**
- Tracks requests per client IP
- Sliding window algorithm
- Automatic cleanup of old records

---

## Frontend Implementation

### Component Structure

```
frontend/src/
├── App.tsx                    # Main application component
├── components/
│   ├── SeatingMap.tsx        # Interactive SVG seating map
│   ├── SeatDetails.tsx       # Seat information panel
│   ├── SeatSummary.tsx       # Selection summary
│   ├── SeatLegend.tsx        # Status legend
│   └── ui/
│       └── card.tsx          # Reusable card component
├── hooks/
│   └── useSeatSelection.ts   # Seat selection logic
├── utils/
│   ├── priceTiers.ts        # Price calculations
│   └── storage.ts           # LocalStorage utilities
└── types/
    └── venue.ts             # TypeScript types
```

### Main Application Flow

#### 1. Data Loading (`App.tsx`)

On mount, the app:
1. Loads `venue.json` from `/public/venue.json`
2. Fetches seat assignments from `/seats/assignments` API
3. Loads saved selections from localStorage

```typescript
useEffect(() => {
  // Load venue data
  fetch('/venue.json')
    .then(res => res.json())
    .then(data => setVenue(data));
  
  // Load seat assignments
  fetch(`${API_BASE_URL}/seats/assignments`)
    .then(res => res.json())
    .then(assignments => {
      // Convert to map for O(1) lookup
      const map = {};
      assignments.forEach(a => map[a.seatId] = a);
      setSeatAssignments(map);
    });
}, []);
```

#### 2. Seat Selection (`useSeatSelection.ts`)

**Features:**
- Maximum 8 seats selectable
- LocalStorage persistence (debounced)
- O(1) lookup using Set data structure

**Implementation:**
```typescript
const toggleSeat = (seat: SelectedSeat) => {
  if (isSelected(seat.id)) {
    // Deselect
    setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
  } else {
    // Select (if under limit)
    if (selectedSeats.length < MAX_SELECTED_SEATS) {
      setSelectedSeats(prev => [...prev, seat]);
    }
  }
};
```

#### 3. Interactive Seating Map (`SeatingMap.tsx`)

**Features:**
- SVG-based rendering for scalability
- Zoom (0.5x - 5x) with mouse wheel
- Pan with Shift+drag or touch
- Keyboard navigation (arrow keys)
- Touch support (pinch zoom, drag pan)
- Real-time seat status updates

**Seat Rendering:**
```typescript
<circle
  cx={seat.x}
  cy={seat.y}
  r={8}
  fill={getStatusColor()}
  onClick={handleClick}
  onTouchEnd={handleSeatTouch}
/>
```

**Status Colors:**
- Available: Black
- Reserved: Yellow
- Sold: Red
- Held: Purple
- Selected: Blue

**Zoom/Pan Implementation:**
- Uses SVG `viewBox` for zoom/pan
- Calculates viewBox based on zoom level and pan offset
- Touch gestures for mobile support

#### 4. Price Calculation (`priceTiers.ts`)

**Price Tiers:**
```typescript
const PRICE_TIERS = {
  1: 50,   // $50
  2: 75,   // $75
  3: 100,  // $100
  4: 150,  // $150
  5: 200   // $200
};
```

**Subtotal Calculation:**
```typescript
const subtotal = seats.reduce((total, seat) => 
  total + PRICE_TIERS[seat.priceTier], 0
);
```

---

## Key Features

### 1. Performance Optimizations

**Backend:**
- LRU caching reduces database calls
- Request deduplication prevents duplicate queries
- Rate limiting protects against abuse

**Frontend:**
- React.memo for seat components (prevents unnecessary re-renders)
- O(1) Set lookups for seat selection
- Debounced localStorage saves
- Efficient SVG rendering

### 2. User Experience

**Interactive Map:**
- Smooth zoom and pan
- Keyboard navigation
- Touch gestures for mobile
- Visual feedback for selections

**Real-time Updates:**
- Seat status from API
- Assignment information display
- Price calculations
- Selection summary

### 3. Data Management

**Caching Strategy:**
- 60-second TTL for user data
- Automatic cache cleanup
- Cache statistics endpoint

**Persistence:**
- LocalStorage for seat selections
- Debounced saves to prevent blocking

### 4. Error Handling

- Graceful API failure handling
- Fallback to default seat statuses
- User-friendly error messages
- Loading states

---

## Data Flow

### Complete Request Flow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Load venue.json
       ▼
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │
       │ 2. GET /seats/assignments
       ▼
┌─────────────┐
│   Backend   │
│  (Express)  │
└──────┬──────┘
       │
       │ 3. Return assignments
       ▼
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │
       │ 4. Render map with statuses
       ▼
┌─────────────┐
│   User      │
│  (Browser)  │
└─────────────┘
```

### User Data Fetch Flow

```
User Request → Rate Limiter → Check Cache → Cache Hit? 
                                          │
                                          ├─ Yes → Return Cached
                                          │
                                          └─ No → DBQueue
                                                      │
                                                      ├─ Request in Queue?
                                                      │
                                                      ├─ Yes → Wait for Promise
                                                      │
                                                      └─ No → Create Promise
                                                                  │
                                                                  ├─ Process Queue
                                                                  │
                                                                  ├─ Fetch from DB (200ms delay)
                                                                  │
                                                                  └─ Cache Result → Return
```

### Seat Selection Flow

```
User Clicks Seat → Check Status → Available?
                                    │
                                    ├─ No → Show Error/Info
                                    │
                                    └─ Yes → Check Selection Limit
                                                    │
                                                    ├─ At Limit → Show Warning
                                                    │
                                                    └─ Under Limit → Add to Selection
                                                                        │
                                                                        ├─ Update UI
                                                                        │
                                                                        ├─ Calculate Price
                                                                        │
                                                                        └─ Save to LocalStorage (debounced)
```

---

## API Usage Examples

### Fetching User Data

```bash
# Get user by ID
curl http://localhost:3000/users/1

# Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Creating User

```bash
# Create new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'

# Response:
{
  "id": 4,
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Getting Seat Assignments

```bash
# Get all assignments
curl http://localhost:3000/seats/assignments

# Response:
[
  {
    "seatId": "A-1-02",
    "userId": 1,
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "status": "reserved",
    "reservedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### Cache Management

```bash
# Get cache statistics
curl http://localhost:3000/cache

# Response:
{
  "size": 10,
  "hits": 45,
  "misses": 12,
  "averageResponseTime": 205.5
}

# Clear cache
curl -X DELETE http://localhost:3000/cache
```

---

## Running the Application

### Backend Setup

```bash
cd backend
pnpm install
pnpm dev  # Runs on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run generate-venue  # Generate venue.json
pnpm dev  # Runs on http://localhost:5173
```

### Environment Variables

Create `.env` in frontend directory:
```
VITE_API_URL=http://localhost:3000
```

---

## Summary

This implementation provides:

1. **Scalable Venue Generation**: Script-based generation of 15,000+ seats
2. **Efficient Backend**: Caching, queuing, and rate limiting
3. **Interactive Frontend**: SVG-based map with zoom, pan, and selection
4. **Real-time Updates**: Seat assignments and status synchronization
5. **Performance**: Optimized rendering and data structures
6. **User Experience**: Responsive design with keyboard and touch support

The system demonstrates modern full-stack development practices with TypeScript, React, Express, and efficient data management strategies.

