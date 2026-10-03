import { buildBooking } from '../src/bookingFactory';
import { expect, test } from '../src/fixtures';
import { bookingSchema, createdBookingSchema, schemaErrors } from '../src/schemas';

test.describe('Booking lifecycle', () => {
  test('create returns the stored booking and an id', async ({ api, token }) => {
    const payload = buildBooking();

    const response = await api.create(payload);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(schemaErrors(createdBookingSchema, body)).toEqual([]);
    expect(body.booking).toEqual(payload);

    await api.delete(body.bookingid, token);
  });

  test('get returns the booking that was created', async ({ api, booking }) => {
    const response = await api.get(booking.bookingid);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(schemaErrors(bookingSchema, body)).toEqual([]);
    expect(body).toEqual(booking.booking);
  });

  test('put replaces every field', async ({ api, booking, token }) => {
    const replacement = buildBooking({
      firstname: 'Grace',
      totalprice: 320,
      depositpaid: false,
      bookingdates: { checkin: '2027-03-01', checkout: '2027-03-04' },
      additionalneeds: 'Late checkout',
    });

    const response = await api.update(booking.bookingid, replacement, token);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(replacement);
    expect(await (await api.get(booking.bookingid)).json()).toEqual(replacement);
  });

  test('patch changes only the fields that were sent', async ({ api, booking, token }) => {
    const response = await api.patch(booking.bookingid, { firstname: 'Grace', totalprice: 99 }, token);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...booking.booking, firstname: 'Grace', totalprice: 99 });
  });

  test('delete removes the booking', async ({ api, token }) => {
    const created = await (await api.create(buildBooking())).json();

    const response = await api.delete(created.bookingid, token);

    expect(response.ok()).toBe(true);
    expect((await api.get(created.bookingid)).status()).toBe(404);
  });

  test('known defect: delete should answer 200 or 204, the API answers 201', async ({ api, token }) => {
    test.fail(true, 'Restful-Booker returns 201 Created for a successful delete');
    const created = await (await api.create(buildBooking())).json();

    const response = await api.delete(created.bookingid, token);

    expect([200, 204]).toContain(response.status());
  });
});
