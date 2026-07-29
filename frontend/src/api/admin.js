import { normalizeProperty } from "./properties";
import { apiRequest } from "./client";

export async function fetchAdminSummary(token) {
  const data = await apiRequest("/admin/summary", { token });
  return {
    ...data,
    latestProperties: (data.latestProperties || []).map(normalizeProperty),
  };
}

export async function fetchAdminProperties(token, filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  );
  const data = await apiRequest(`/admin/properties?${params.toString()}`, { token });
  return (data.properties || []).map(normalizeProperty);
}

export function setAdminPropertyVisibility(token, propertyId, isHidden) {
  return apiRequest(`/admin/properties/${propertyId}/visibility`, {
    method: "PATCH",
    token,
    body: { isHidden },
  });
}

export function deleteAdminProperty(token, propertyId) {
  return apiRequest(`/admin/properties/${propertyId}`, { method: "DELETE", token });
}

export async function fetchAdminUsers(token, search = "") {
  const params = new URLSearchParams(search ? { search } : {});
  const data = await apiRequest(`/admin/users?${params.toString()}`, { token });
  return data.users || [];
}

export function updateAdminUser(token, userId, body) {
  return apiRequest(`/admin/users/${userId}`, { method: "PATCH", token, body });
}

export function deleteAdminUser(token, userId) {
  return apiRequest(`/admin/users/${userId}`, { method: "DELETE", token });
}

export async function fetchContactMessages(token) {
  const data = await apiRequest("/admin/contact-messages", { token });
  return data.messages || [];
}

export function updateContactMessage(token, messageId, isRead) {
  return apiRequest(`/admin/contact-messages/${messageId}`, {
    method: "PATCH",
    token,
    body: { isRead },
  });
}

export function deleteContactMessage(token, messageId) {
  return apiRequest(`/admin/contact-messages/${messageId}`, { method: "DELETE", token });
}

export async function fetchReports(token) {
  const data = await apiRequest("/admin/reports", { token });
  return data.reports || [];
}

export function dismissReport(token, reportId) {
  return apiRequest(`/admin/reports/${reportId}/dismiss`, { method: "PATCH", token });
}
