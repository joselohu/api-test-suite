import { test as base, expect } from '@playwright/test';
import { BookingClient } from './BookingClient';
import { buildBooking } from './bookingFactory';
import type { CreatedBooking } from './types';

interface Fixtures {
  api: BookingClient;
  token: string;
  /** A fresh booking that is deleted again when the test ends. */
  booking: CreatedBooking;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => use(new BookingClient(request)),

  token: async ({ api }, use) => use(await api.token()),

  booking: async ({ api, token }, use) => {
    const response = await api.create(buildBooking());
    expect(response.status()).toBe(200);
    const created: CreatedBooking = await response.json();

    await use(created);

    await api.delete(created.bookingid, token);
  },
});

export { expect };
