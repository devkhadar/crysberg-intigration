const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const mk3Api = {
  getState: () => fetchApi('/mk3/state'),
  getVoltage: () => fetchApi('/mk3/voltage'),
  getCurrent: () => fetchApi('/mk3/current'),
  getDecoders: () => fetchApi('/mk3/decoders'),
  getDetails: () => fetchApi('/mk3/details'),
};

export const irrigationApi = {
  getStatus: (luId: string, stationId: string) => fetchApi(`/irrigation/status/${luId}/${stationId}`),
  turnOn: (luId: string, stationId: string) => fetchApi(`/irrigation/on/${luId}/${stationId}`, { method: 'POST' }),
  turnOff: (luId: string, stationId: string) => fetchApi(`/irrigation/off/${luId}/${stationId}`, { method: 'POST' }),
  toggle: (luId: string, stationId: string) => fetchApi(`/control/${luId}/${stationId}`, { method: 'POST' }),
};
