const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function loginStaffApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function loginGuestApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/guest-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function registerGuestApi(data) {
  const res = await fetch(`${API_BASE}/auth/guest-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchRoomsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/rooms?${query}`);
  return res.json();
}

export async function fetchRoomTypesApi() {
  const res = await fetch(`${API_BASE}/rooms/types`);
  return res.json();
}

export async function fetchBranchesApi() {
  const res = await fetch(`${API_BASE}/rooms/branches`);
  return res.json();
}

export async function updateHousekeepingStatusApi(roomId, housekeepingStatus) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/housekeeping`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ housekeepingStatus })
  });
  return res.json();
}

export async function fetchReservationsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/reservations?${query}`);
  return res.json();
}

export async function createReservationApi(data) {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function checkInReservationApi(reservationId) {
  const res = await fetch(`${API_BASE}/reservations/${reservationId}/check-in`, {
    method: 'POST'
  });
  return res.json();
}

export async function checkOutReservationApi(reservationId) {
  const res = await fetch(`${API_BASE}/reservations/${reservationId}/check-out`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchHousekeepingTasksApi() {
  const res = await fetch(`${API_BASE}/housekeeping`);
  return res.json();
}

export async function updateHousekeepingTaskStatusApi(taskId, status) {
  const res = await fetch(`${API_BASE}/housekeeping/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchStaffDirectoryApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/operations/staff?${query}`);
  return res.json();
}

export async function fetchAnalyticsApi() {
  const res = await fetch(`${API_BASE}/operations/analytics`);
  return res.json();
}
