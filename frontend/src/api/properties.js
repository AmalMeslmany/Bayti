import fallbackPropertyImage from "../assets/bayti-hero.jpg";

const API_BASE_URL = "/api";

function formatPrice(price) {
  return `$${Number(price).toLocaleString()}`;
}

export function normalizeProperty(property) {
  const id = property._id || property.id;

  return {
    ...property,
    id,
    image: property.image || fallbackPropertyImage,
    price: typeof property.price === "number" ? formatPrice(property.price) : property.price,
    priceValue:
      typeof property.price === "number"
        ? property.price
        : Number(String(property.price).replace(/[^0-9]/g, "")),
  };
}

export async function fetchProperties() {
  const response = await fetch(`${API_BASE_URL}/properties`);

  if (!response.ok) {
    throw new Error("Unable to load properties.");
  }

  const data = await response.json();
  return (data.properties || []).map(normalizeProperty);
}

export async function fetchPropertyById(id) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);

  if (!response.ok) {
    throw new Error("Unable to load property.");
  }

  const data = await response.json();
  return normalizeProperty(data.property);
}
