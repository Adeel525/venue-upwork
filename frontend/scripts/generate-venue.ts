import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Venue, SeatStatus } from '../src/types/venue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_SEATS = 15000;
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const STATUSES: SeatStatus[] = ['available', 'reserved', 'sold', 'held'];
const PRICE_TIERS = [1, 2, 3, 4, 5] as const;

// Distribution: 60% available, 20% reserved, 15% sold, 5% held
const STATUS_WEIGHTS = [0.6, 0.2, 0.15, 0.05];

function getRandomStatus(): SeatStatus {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < STATUS_WEIGHTS.length; i++) {
    cumulative += STATUS_WEIGHTS[i];
    if (rand < cumulative) {
      return STATUSES[i];
    }
  }
  return 'available';
}

function generateVenue(): Venue {
  const sections: Section[] = [];
  let totalSeats = 0;
  const seatsPerSection = Math.ceil(TARGET_SEATS / SECTIONS.length);

  SECTIONS.forEach((sectionId, sectionIndex) => {
    const rows: Row[] = [];
    const rowsPerSection = 30 + Math.floor(Math.random() * 20); // 30-50 rows per section
    const seatsPerRow = Math.ceil(seatsPerSection / rowsPerSection);
    
    let sectionSeats = 0;
    let rowIndex = 1;

    // Generate rows until we have enough seats for this section
    while (sectionSeats < seatsPerSection && rowIndex <= rowsPerSection) {
      const seats: Seat[] = [];
      const actualSeatsInRow = Math.min(seatsPerRow, seatsPerSection - sectionSeats);
      
      for (let col = 1; col <= actualSeatsInRow; col++) {
        const seatId = `${sectionId}-${rowIndex}-${String(col).padStart(2, '0')}`;
        const x = 50 + (col - 1) * 30 + (sectionIndex % 4) * 300;
        const y = 40 + (rowIndex - 1) * 25 + Math.floor(sectionIndex / 4) * 600;
        
        seats.push({
          id: seatId,
          col,
          x,
          y,
          priceTier: PRICE_TIERS[Math.floor(Math.random() * PRICE_TIERS.length)],
          status: getRandomStatus(),
        });
      }

      rows.push({
        index: rowIndex,
        seats,
      });

      sectionSeats += seats.length;
      rowIndex++;
    }

    sections.push({
      id: sectionId,
      label: `Section ${sectionId}`,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
      },
      rows,
    });

    totalSeats += sectionSeats;
  });

  return {
    venueId: 'arena-01',
    name: 'Metropolis Arena',
    map: {
      width: 2048,
      height: 1536,
    },
    sections,
  };
}

// Generate and write venue data
const venue = generateVenue();
const outputPath = join(__dirname, '..', 'public', 'venue.json');

writeFileSync(outputPath, JSON.stringify(venue, null, 2), 'utf-8');

const totalSeats = venue.sections.reduce(
  (sum, section) => sum + section.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0),
  0
);

console.log(`Generated venue with ${venue.sections.length} sections and ${totalSeats} seats`);
console.log(`Output written to: ${outputPath}`);

