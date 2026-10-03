import { adminCredentials } from '../src/BookingClient';
import { expect, test } from '../src/fixtures';

test.describe('POST /auth', () => {
  test('valid credentials return a token', async ({ api }) => {
    const response = await api.auth(adminCredentials);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('wrong password returns no token', async ({ api }) => {
    const response = await api.auth({ ...adminCredentials, password: 'wrong-password' });

    const body = await response.json();
    expect(body).toEqual({ reason: 'Bad credentials' });
    expect(body.token).toBeUndefined();
  });

  test('known defect: wrong password should answer 401, the API answers 200', async ({ api }) => {
    test.fail(true, 'Restful-Booker returns 200 for rejected credentials');
    const response = await api.auth({ ...adminCredentials, password: 'wrong-password' });
    expect(response.status()).toBe(401);
  });
});

test.describe('GET /ping', () => {
  test('health check responds', async ({ request }) => {
    const response = await request.get('/ping');
    expect(response.ok()).toBe(true);
  });
});
