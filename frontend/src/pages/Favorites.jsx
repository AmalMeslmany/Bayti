import PropertyCard from "../components/PropertyCard";
import { useTranslation } from "react-i18next";
import "./Properties.css";

function Favorites({
  areFavoritesLoading,
  favoriteIds,
  favoriteProperties,
  favoritesError,
  onToggleFavorite,
}) {
  const { t } = useTranslation();

  return (
    <main className="properties-page">
      <header className="properties-header">
        <h1 id="favorites-heading">
          {t("favorites.title", { count: favoriteProperties.length })}
        </h1>
        <p>{t("favorites.subtitle")}</p>
      </header>

      {areFavoritesLoading && (
        <p className="properties-empty">{t("favorites.loading")}</p>
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
          {t("favorites.empty")}
        </p>
      )}
    </main>
  );
}

export default Favorites;
