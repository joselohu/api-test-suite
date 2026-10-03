import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import type { Booking, CreatedBooking } from './types';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const bookingSchema: JSONSchemaType<Booking> = {
  type: 'object',
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      properties: {
        checkin: { type: 'string', format: 'date' },
        checkout: { type: 'string', format: 'date' },
      },
      required: ['checkin', 'checkout'],
      additionalProperties: false,
    },
    additionalneeds: { type: 'string', nullable: true },
  },
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
};

export const createdBookingSchema: JSONSchemaType<CreatedBooking> = {
  type: 'object',
  properties: {
    bookingid: { type: 'integer' },
    booking: bookingSchema,
  },
  required: ['bookingid', 'booking'],
  additionalProperties: false,
};

export const bookingIdListSchema: JSONSchemaType<{ bookingid: number }[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: { bookingid: { type: 'integer' } },
    required: ['bookingid'],
    additionalProperties: false,
  },
};

/** Returns a readable list of schema violations, empty when the body is valid. */
export function schemaErrors<T>(schema: JSONSchemaType<T>, body: unknown): string[] {
  const validate = ajv.compile(schema);
  validate(body);
  return (validate.errors ?? []).map((error) => `${error.instancePath || '(root)'} ${error.message}`);
}
