import { useEffect, useState } from "react";
import { fetchProperties } from "../api/properties";
import PropertyCard from "../components/PropertyCard";
import "./Properties.css";

function Favorites({ favoriteIds, onToggleFavorite }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const loadedProperties = await fetchProperties();
        setProperties(loadedProperties);
      } catch {
        setErrorMessage("Unable to load favorite properties right now.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProperties();
  }, []);

  const favoriteProperties = properties.filter((property) =>
    favoriteIds.includes(property.id),
  );

  return (
    <main className="properties-page">
      <header className="properties-header">
        <h1 id="favorites-heading">
          Favorite Properties ({favoriteProperties.length})
        </h1>
        <p>
          Keep track of the homes you love and return to them whenever you are
          ready.
        </p>
      </header>

      {isLoading && <p className="properties-empty">Loading favorites...</p>}

      {errorMessage && <p className="properties-empty">{errorMessage}</p>}

      {!isLoading && !errorMessage && favoriteProperties.length > 0 ? (
        <section
          className={`properties-grid ${
            favoriteProperties.length === 1 ? "properties-grid-single" : ""
          }`}
          aria-labelledby="favorites-heading"
        >
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              isFavorite={favoriteIds.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </section>
      ) : null}

      {!isLoading && !errorMessage && favoriteProperties.length === 0 && (
        <p className="properties-empty">
          No favorite properties yet. Add homes you like from the Properties
          page.
        </p>
      )}
    </main>
  );
}

export default Favorites;
