import { apiRequest } from "./client";

export function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: userData,
  });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function fetchAuthenticatedUser(token) {
  return apiRequest("/auth/me", {
    token,
  });
}

export function updateProfile(profileData, token) {
  return apiRequest("/users/profile", {
    method: "PUT",
    token,
    body: profileData,
  });
}
