import { buildBooking } from '../src/bookingFactory';
import { expect, test } from '../src/fixtures';

const MISSING_ID = 999_999_999;

test.describe('Authorization', () => {
  test('put without a token is forbidden and changes nothing', async ({ api, booking }) => {
    const response = await api.update(booking.bookingid, buildBooking({ firstname: 'Mallory' }));

    expect(response.status()).toBe(403);
    expect(await (await api.get(booking.bookingid)).json()).toEqual(booking.booking);
  });

  test('patch without a token is forbidden', async ({ api, booking }) => {
    const response = await api.patch(booking.bookingid, { firstname: 'Mallory' });
    expect(response.status()).toBe(403);
  });

  test('delete without a token is forbidden and keeps the booking', async ({ api, booking }) => {
    const response = await api.delete(booking.bookingid);

    expect(response.status()).toBe(403);
    expect((await api.get(booking.bookingid)).status()).toBe(200);
  });

  test('an invalid token is rejected', async ({ api, booking }) => {
    const response = await api.delete(booking.bookingid, 'not-a-real-token');
    expect(response.status()).toBe(403);
  });
});

test.describe('Missing resources', () => {
  test('get on an unknown id answers 404', async ({ api }) => {
    expect((await api.get(MISSING_ID)).status()).toBe(404);
  });

  test('known defect: delete on an unknown id should answer 404, the API answers 405', async ({ api, token }) => {
    test.fail(true, 'Restful-Booker returns 405 Method Not Allowed for an unknown booking id');
    expect((await api.delete(MISSING_ID, token)).status()).toBe(404);
  });
});

test.describe('Input validation', () => {
  test('known defect: a body without required fields should answer 400, the API answers 500', async ({ api }) => {
    test.fail(true, 'Restful-Booker crashes with 500 instead of validating the body');
    expect((await api.create({ lastname: 'Only' })).status()).toBe(400);
  });

  test('known defect: checkout before checkin should be rejected, the API stores it', async ({ api, token }) => {
    test.fail(true, 'Restful-Booker accepts a stay that ends before it starts');
    const response = await api.create(
      buildBooking({ bookingdates: { checkin: '2027-02-10', checkout: '2027-01-15' } }),
    );
    if (response.ok()) await api.delete((await response.json()).bookingid, token);

    expect(response.status()).toBe(400);
  });

  test('known defect: a negative price should be rejected, the API stores it', async ({ api, token }) => {
    test.fail(true, 'Restful-Booker accepts a negative total price');
    const response = await api.create(buildBooking({ totalprice: -5 }));
    if (response.ok()) await api.delete((await response.json()).bookingid, token);

    expect(response.status()).toBe(400);
  });
});
