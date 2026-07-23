import { apiRequest } from "./client";
import { normalizeProperty } from "./properties";

export async function fetchFavorites(token) {
  const data = await apiRequest("/favorites", {
    token,
  });

  return (data.favorites || []).map(normalizeProperty);
}

export async function addFavorite(propertyId, token) {
  const data = await apiRequest(`/favorites/${propertyId}`, {
    method: "POST",
    token,
  });

  return (data.favorites || []).map(normalizeProperty);
}

export function removeFavorite(propertyId, token) {
  return apiRequest(`/favorites/${propertyId}`, {
    method: "DELETE",
    token,
  });
}
