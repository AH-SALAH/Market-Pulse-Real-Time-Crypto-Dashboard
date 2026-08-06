// Alerts API client — calls the local route handlers (server data lives in
// React Query; this is the equivalent of lib/watchlist.ts for alert reads).

export interface AlertItem {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  note?: string;
  createdAt: string;
}

export interface CreateAlertInput {
  coinId: string;
  coinName: string;
  targetPrice: number;
  note?: string;
}

const API_BASE = '/api/alerts';

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Alert request failed: ${response.status}`);
  }
  return response;
}

export async function getAlerts(): Promise<AlertItem[]> {
  const response = await request('');
  return response.json();
}

export async function createAlert(input: CreateAlertInput): Promise<AlertItem> {
  const response = await request('', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.json();
}

export async function deleteAlert(id: string): Promise<AlertItem[]> {
  const response = await request(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return response.json();
}
