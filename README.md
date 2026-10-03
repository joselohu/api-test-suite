# API Test Suite

[![API tests](https://github.com/joselohu/api-test-suite/actions/workflows/api-tests.yml/badge.svg)](https://github.com/joselohu/api-test-suite/actions/workflows/api-tests.yml)

API tests for [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), a public hotel booking API. The same service is tested two ways:

- **Playwright API tests in TypeScript**, for depth: schema validation, negative cases, authorization and documented defects.
- **A Postman collection run by Newman**, for a chained booking lifecycle that anyone on a team can open and run in Postman.

## What it covers

| Area | Checks |
|---|---|
| Authentication | token issued for valid credentials, no token for a wrong password |
| Booking lifecycle | create, read, replace (PUT), partial update (PATCH), delete, confirm it is gone |
| Schemas | every booking response is validated against a JSON Schema with Ajv |
| Search | list ids, filter by name, empty result |
| Authorization | PUT, PATCH and DELETE without a token or with an invalid token answer 403 and change nothing |
| Missing resources | unknown ids |
| Input validation | missing fields, impossible dates, negative price |

The Playwright suite has 22 tests. The Postman collection has 11 requests and 29 assertions.

## Run it

```bash
npm ci
npm test                  # both suites
npm run test:playwright   # Playwright only
npm run test:postman      # Newman only, HTML report in newman-report/
```

To use Postman itself, import the two files in `postman/` and run the collection in order.

## Defects found in the API

The suite documents six places where the API behaves differently from what a client would expect. Each one is a test marked with `test.fail`, which asserts the correct behaviour and is expected to fail. The suite stays green today, and the day a defect is fixed its test fails and asks to be updated.

| # | Request | Expected | Actual |
|---|---|---|---|
| 1 | `POST /auth` with a wrong password | 401 | 200 with `{"reason": "Bad credentials"}` |
| 2 | `DELETE /booking/:id` on an existing booking | 200 or 204 | 201 Created |
| 3 | `DELETE /booking/:id` on an unknown id | 404 | 405 Method Not Allowed |
| 4 | `POST /booking` without required fields | 400 with a validation message | 500 Internal Server Error |
| 5 | `POST /booking` with checkout before checkin | 400 | 200, the booking is stored |
| 6 | `POST /booking` with a negative price | 400 | 200, the booking is stored |

## How it is built

```
src/
  BookingClient.ts    One method per endpoint; tests never build URLs
  bookingFactory.ts   Valid booking payloads with a unique marker
  schemas.ts          JSON Schemas and an Ajv helper with readable errors
  fixtures.ts         api client, auth token, and a booking that cleans itself up
tests/                One spec per concern
postman/              Collection and environment
```

Design decisions:

- **Tests own their data.** Restful-Booker is a shared public server that resets regularly. Every test creates the booking it needs, with a unique last name, and deletes it afterwards. Nothing depends on existing records.
- **Fixtures do setup and teardown.** A test that needs a booking asks for the `booking` fixture and gets one that is removed when the test ends, even if it fails.
- **Write checks read back.** A rejected update is followed by a GET that proves the record did not change.
- **One retry locally, two in CI.** The demo API runs on a free host and occasionally drops a request.

## CI

GitHub Actions runs both suites on every push and pull request, and on weekdays on a schedule so that a change in the public API is noticed. Reports are uploaded as artifacts.

## Notes

The credentials in this repository are the public demo values from the Restful-Booker documentation.
