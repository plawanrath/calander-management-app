import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export function setToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearToken() {
  delete api.defaults.headers.common['Authorization'];
}

export async function login(username, password) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  const response = await api.post('/token', params);
  return response.data;
}

export async function getMe() {
  const response = await api.get('/me');
  return response.data;
}

export async function createUser(data) {
  const response = await api.post('/admin/users', data);
  return response.data;
}

export async function getAllCustomers() {
  const response = await api.get('/admin/customers');
  return response.data;
}

export async function getAllSpecialists() {
  const response = await api.get('/admin/specialists');
  return response.data;
}

export async function assignSpecialist(customerId, specialistId) {
  const url = `/admin/customers/${customerId}/specialists/${specialistId}`;
  const response = await api.post(url);
  return response.data;
}

export async function createWeeklyPlan(customerId, description) {
  const url = `/admin/customers/${customerId}/weekly_plan`;
  const response = await api.post(url, null, { params: { description } });
  return response.data;
}

export async function getAllAppointments() {
  const response = await api.get('/admin/specialists/appointments');
  return response.data;
}

export async function getCustomerAppointments(customerId) {
  const url = `/customers/${customerId}/appointments`;
  const response = await api.get(url);
  return response.data;
}

export async function getCustomerSpecialists(customerId) {
  const url = `/customers/${customerId}/specialists`;
  const response = await api.get(url);
  return response.data;
}

export async function getSpecialistAppointments(specialistId) {
  const url = `/specialists/${specialistId}/appointments`;
  const response = await api.get(url);
  return response.data;
}

export async function createAppointment(customerId, specialistId, time, endTime, title) {
  const url = `/customers/${customerId}/appointments`;
  const response = await api.post(url, null, {
    params: { specialist_id: specialistId, time, end_time: endTime, title },
  });
  return response.data;
}

export async function getCustomerPlans(customerId) {
  const url = `/customers/${customerId}/weekly_plans`;
  const response = await api.get(url);
  return response.data;
}
