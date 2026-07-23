import PropertyCard from "../components/PropertyCard";
import "./Properties.css";

function Favorites({
  areFavoritesLoading,
  favoriteIds,
  favoriteProperties,
  favoritesError,
  onToggleFavorite,
}) {
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

      {areFavoritesLoading && (
        <p className="properties-empty">Loading favorites...</p>
      )}

      {favoritesError && <p className="properties-empty">{favoritesError}</p>}

      {!areFavoritesLoading && !favoritesError && favoriteProperties.length > 0 ? (
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

      {!areFavoritesLoading && !favoritesError && favoriteProperties.length === 0 && (
        <p className="properties-empty">
          No favorite properties yet. Add homes you like from the Properties
          page.
        </p>
      )}
    </main>
  );
}

export default Favorites;
