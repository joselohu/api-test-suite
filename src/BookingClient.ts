import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from './types';

export interface Credentials {
  username: string;
  password: string;
}

// Restful-Booker documents these credentials publicly; they are demo data, not secrets.
export const adminCredentials: Credentials = {
  username: process.env.BOOKER_USERNAME ?? 'admin',
  password: process.env.BOOKER_PASSWORD ?? 'password123',
};

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  auth(credentials: Credentials): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  async token(credentials: Credentials = adminCredentials): Promise<string> {
    const response = await this.auth(credentials);
    return (await response.json()).token;
  }

  list(filters: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: filters });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  create(booking: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeaders(token) });
  }

  patch(id: number, changes: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: this.authHeaders(token) });
  }

  delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders(token) });
  }

  private authHeaders(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
