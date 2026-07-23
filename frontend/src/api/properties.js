import fallbackPropertyImage from "../assets/bayti-hero.jpg";
import { apiRequest } from "./client";

function formatPrice(price) {
  return `$${Number(price).toLocaleString()}`;
}

export function normalizeProperty(property) {
  const id = property._id || property.id;
  const images =
    property.images && property.images.length > 0
      ? property.images
      : property.image
        ? [{ url: property.image, path: property.imagePath || "" }]
        : [];

  return {
    ...property,
    id,
    images,
    image: images[0]?.url || fallbackPropertyImage,
    price: typeof property.price === "number" ? formatPrice(property.price) : property.price,
    priceValue:
      typeof property.price === "number"
        ? property.price
        : Number(String(property.price).replace(/[^0-9]/g, "")),
  };
}

export async function fetchProperties() {
  const data = await apiRequest("/properties");
  return (data.properties || []).map(normalizeProperty);
}

export async function fetchPropertyById(id) {
  const data = await apiRequest(`/properties/${id}`);
  return normalizeProperty(data.property);
}

export async function createProperty(propertyData, token) {
  const data = await apiRequest("/properties", {
    method: "POST",
    token,
    body: propertyData,
  });

  return normalizeProperty(data.property);
}

export async function updateProperty(propertyId, propertyData, token) {
  const data = await apiRequest(`/properties/${propertyId}`, {
    method: "PUT",
    token,
    body: propertyData,
  });

  return normalizeProperty(data.property);
}

export function deleteProperty(propertyId, token) {
  return apiRequest(`/properties/${propertyId}`, {
    method: "DELETE",
    token,
  });
}
