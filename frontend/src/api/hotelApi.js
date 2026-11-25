const API_BASE = '/api';

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    return res.ok
      ? {}
      : { error: `Server returned empty response (HTTP ${res.status}). Make sure the backend server is running on port 5000.` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Invalid server response (HTTP ${res.status}).` };
  }
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return parseResponse(res);
}

export async function loginStaffApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res);
}

export async function loginGuestApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/guest-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res);
}

export async function registerGuestApi(data) {
  const res = await fetch(`${API_BASE}/auth/guest-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return parseResponse(res);
}

export async function fetchRoomsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/rooms?${query}`);
  return parseResponse(res);
}

export async function fetchRoomTypesApi() {
  const res = await fetch(`${API_BASE}/rooms/types`);
  return parseResponse(res);
}

export async function fetchBranchesApi() {
  const res = await fetch(`${API_BASE}/rooms/branches`);
  return parseResponse(res);
}

export async function updateHousekeepingStatusApi(roomId, housekeepingStatus) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/housekeeping`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ housekeepingStatus })
  });
  return parseResponse(res);
}

export async function fetchReservationsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/reservations?${query}`);
  return parseResponse(res);
}

export async function createReservationApi(data) {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return parseResponse(res);
}

export async function checkInReservationApi(reservationId) {
  const res = await fetch(`${API_BASE}/reservations/${reservationId}/check-in`, {
    method: 'POST'
  });
  return parseResponse(res);
}

export async function checkOutReservationApi(reservationId) {
  const res = await fetch(`${API_BASE}/reservations/${reservationId}/check-out`, {
    method: 'POST'
  });
  return parseResponse(res);
}

export async function fetchHousekeepingTasksApi() {
  const res = await fetch(`${API_BASE}/housekeeping`);
  return parseResponse(res);
}

export async function updateHousekeepingTaskStatusApi(taskId, status) {
  const res = await fetch(`${API_BASE}/housekeeping/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}

export async function fetchStaffDirectoryApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/operations/staff?${query}`);
  return parseResponse(res);
}

export async function fetchInvoicesApi() {
  const res = await fetch(`${API_BASE}/operations/invoices`);
  return parseResponse(res);
}

export async function fetchGuestsApi() {
  const res = await fetch(`${API_BASE}/operations/guests`);
  return parseResponse(res);
}

export async function fetchAnalyticsApi() {
  const res = await fetch(`${API_BASE}/operations/analytics`);
  return parseResponse(res);
}

export async function fetchSpaServicesApi() {
  const res = await fetch(`${API_BASE}/spa/services`);
  return parseResponse(res);
}

export async function fetchTherapistsApi() {
  const res = await fetch(`${API_BASE}/spa/therapists`);
  return parseResponse(res);
}

export async function fetchSpaAppointmentsApi() {
  const res = await fetch(`${API_BASE}/spa/appointments`);
  return parseResponse(res);
}

export async function bookSpaAppointmentApi(data) {
  const res = await fetch(`${API_BASE}/spa/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return parseResponse(res);
}

export async function updateSpaAppointmentStatusApi(appointmentId, status) {
  const res = await fetch(`${API_BASE}/spa/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}

export async function validateCouponApi(code, subtotal = 0) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  return parseResponse(res);
}

export async function fetchDiningMenuApi() {
  const res = await fetch(`${API_BASE}/dining/menu`);
  return parseResponse(res);
}

export async function fetchFoodOrdersApi() {
  const res = await fetch(`${API_BASE}/dining/orders`);
  return parseResponse(res);
}

export async function createFoodOrderApi(data) {
  const res = await fetch(`${API_BASE}/dining/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return parseResponse(res);
}

export async function updateFoodOrderStatusApi(orderId, status) {
  const res = await fetch(`${API_BASE}/dining/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}
