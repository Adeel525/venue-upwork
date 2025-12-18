export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';
export type PriceTier = 1 | 2 | 3 | 4 | 5;

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: PriceTier;
  status: SeatStatus;
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

export interface VenueMap {
  width: number;
  height: number;
}

export interface Venue {
  venueId: string;
  name: string;
  map: VenueMap;
  sections: Section[];
}

export interface SelectedSeat extends Seat {
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
}

export interface SeatAssignment {
  seatId: string;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'reserved' | 'sold' | 'held';
  reservedAt?: string;
}

