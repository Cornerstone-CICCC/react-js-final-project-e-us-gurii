// Thin client for the VoyagePlan backend (Express + Prisma + Neon).
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const registerUser = (payload) => request('/auth/register', { method: 'POST', body: payload });
export const loginUser = (payload) => request('/auth/login', { method: 'POST', body: payload });
export const createTrip = (payload, token) => request('/trips', { method: 'POST', body: payload, token });
export const getMyTrips = (token) => request('/trips/my-trips', { token });
export const getTrip = (id, token) => request(`/trips/${id}`, { token });
export const updateTrip = (id, payload, token) => request(`/trips/${id}`, { method: 'PUT', body: payload, token });
export const deleteTrip = (id, token) => request(`/trips/${id}`, { method: 'DELETE', token });
