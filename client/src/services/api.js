import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export async function fetchIncidents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/incidents?${query}`);
  return res.json();
}

export async function submitIncidentReport(data) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getAiTriagePreview(description) {
  const res = await fetch(`${API_BASE}/incidents/triage-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  return res.json();
}

export async function triggerDsaMatch(incidentId) {
  const res = await fetch(`${API_BASE}/dispatches/auto-match/${incidentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function fetchResponders() {
  const res = await fetch(`${API_BASE}/responders`);
  return res.json();
}

export async function fetchShelters() {
  const res = await fetch(`${API_BASE}/shelters`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}

export async function fetchPredictiveAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/predictive`);
  return res.json();
}

export async function fetchMissingPersons() {
  const res = await fetch(`${API_BASE}/missing-persons`);
  return res.json();
}

export async function submitMissingPerson(data) {
  const res = await fetch(`${API_BASE}/missing-persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchDonations() {
  const res = await fetch(`${API_BASE}/donations`);
  return res.json();
}

export async function submitDonation(data) {
  const res = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
