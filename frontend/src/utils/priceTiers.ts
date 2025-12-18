import type { PriceTier } from '@/types/venue';

// Price mapping for each tier
export const PRICE_TIERS: Record<PriceTier, number> = {
  1: 50,
  2: 75,
  3: 100,
  4: 150,
  5: 200,
};

export function getPriceForTier(tier: PriceTier): number {
  return PRICE_TIERS[tier];
}

export function calculateSubtotal(seats: Array<{ priceTier: PriceTier }>): number {
  return seats.reduce((total, seat) => total + getPriceForTier(seat.priceTier), 0);
}

