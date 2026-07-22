import { useState } from "react";
import PropertyCard from "../components/PropertyCard";
import properties from "../data/properties";
import "./Properties.css";

function getPriceNumber(price) {
  return Number(price.replace(/[^0-9]/g, ""));
}

function Properties({ favoriteIds, onToggleFavorite }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const filteredProperties = properties.filter((property) => {
    const searchValue = searchTerm.toLowerCase().trim();
    const propertyPrice = getPriceNumber(property.price);

    const matchesSearch =
      property.title.toLowerCase().includes(searchValue) ||
      property.location.toLowerCase().includes(searchValue);

    const matchesMinPrice =
      minPrice === "" || propertyPrice >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === "" || propertyPrice <= Number(maxPrice);

    const matchesBedrooms =
      bedrooms === "" || property.bedrooms >= Number(bedrooms);

    return (
      matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBedrooms
    );
  });

  return (
    <main className="properties-page">
      <header className="properties-header">
        <h1 id="properties-heading">Featured Properties</h1>
        <p>
          Explore a curated selection of homes designed for comfort, location,
          and long-term value.
        </p>
      </header>

      <section className="properties-filters" aria-label="Property filters">
        <div className="filter-field filter-field-wide">
          <label htmlFor="property-search">Search</label>
          <input
            id="property-search"
            type="search"
            placeholder="Search by title or location"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="min-price">Minimum Price</label>
          <input
            id="min-price"
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="max-price">Maximum Price</label>
          <input
            id="max-price"
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="bedrooms">Bedrooms</label>
          <select
            id="bedrooms"
            value={bedrooms}
            onChange={(event) => setBedrooms(event.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </section>

      <section className="properties-grid" aria-labelledby="properties-heading">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            {...property}
            isFavorite={favoriteIds.includes(property.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </section>

      {filteredProperties.length === 0 && (
        <p className="properties-empty">No properties found.</p>
      )}
    </main>
  );
}

export default Properties;
