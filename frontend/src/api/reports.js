import { apiRequest } from "./client";

export function reportProperty(propertyId, reportData) {
  return apiRequest(`/properties/${propertyId}/reports`, {
    method: "POST",
    body: reportData,
  });
}
