import { apiRequest } from "./client";

export function sendContactMessage(contactData) {
  return apiRequest("/contact", {
    method: "POST",
    body: contactData,
  });
}
