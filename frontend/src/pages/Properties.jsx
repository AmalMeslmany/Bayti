import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchProperties } from "../api/properties";
import PropertyCard from "../components/PropertyCard";
import "./Properties.css";

function Properties({ favoriteIds, onToggleFavorite }) {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const loadedProperties = await fetchProperties();
        setProperties(loadedProperties);
      } catch {
        setErrorMessage(t("properties.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    loadProperties();
  }, [t]);

  const filteredProperties = properties.filter((property) => {
    const searchValue = searchTerm.toLowerCase().trim();
    const propertyPrice = property.priceValue;

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
        <h1 id="properties-heading">{t("properties.title")}</h1>
        <p>{t("properties.subtitle")}</p>
      </header>

      <section className="properties-filters" aria-label={t("properties.filters")}>
        <div className="filter-field filter-field-wide">
          <label htmlFor="property-search">{t("properties.search")}</label>
          <input
            id="property-search"
            type="search"
            placeholder={t("properties.searchPlaceholder")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="min-price">{t("properties.minPrice")}</label>
          <input
            id="min-price"
            type="number"
            min="0"
            placeholder={t("properties.min")}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="max-price">{t("properties.maxPrice")}</label>
          <input
            id="max-price"
            type="number"
            min="0"
            placeholder={t("properties.max")}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="bedrooms">{t("properties.bedrooms")}</label>
          <select
            id="bedrooms"
            value={bedrooms}
            onChange={(event) => setBedrooms(event.target.value)}
          >
            <option value="">{t("properties.any")}</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </section>

      {isLoading && <p className="properties-empty">{t("properties.loading")}</p>}

      {errorMessage && <p className="properties-empty">{errorMessage}</p>}

      {!isLoading && !errorMessage && filteredProperties.length > 0 && (
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
      )}

      {!isLoading && !errorMessage && properties.length === 0 && (
        <p className="properties-empty">{t("properties.empty")}</p>
      )}

      {!isLoading &&
        !errorMessage &&
        properties.length > 0 &&
        filteredProperties.length === 0 && (
          <p className="properties-empty">{t("properties.notFound")}</p>
      )}
    </main>
  );
}

export default Properties;
