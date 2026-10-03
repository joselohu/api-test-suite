import { expect, test } from '../src/fixtures';
import { bookingIdListSchema, schemaErrors } from '../src/schemas';

test.describe('GET /booking', () => {
  test('lists booking ids', async ({ api, booking }) => {
    const response = await api.list();

    expect(response.status()).toBe(200);
    const body: { bookingid: number }[] = await response.json();
    expect(schemaErrors(bookingIdListSchema, body)).toEqual([]);
    expect(body.map((entry) => entry.bookingid)).toContain(booking.bookingid);
  });

  test('filters by first and last name', async ({ api, booking }) => {
    const { firstname, lastname } = booking.booking;

    const response = await api.list({ firstname, lastname });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([{ bookingid: booking.bookingid }]);
  });

  test('a name nobody has returns an empty list', async ({ api }) => {
    const response = await api.list({ lastname: 'no-such-guest-5f1c9e' });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});
