import { randomUUID } from 'node:crypto';
import type { Booking } from './types';

/**
 * Builds a valid booking. The last name carries a unique marker so tests can
 * find their own records on a shared public server.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Ada',
    lastname: `Lovelace-${randomUUID().slice(0, 8)}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
