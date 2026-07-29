import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CallOwnerButton from "./CallOwnerButton";
import WhatsAppButton from "./WhatsAppButton";
import "./PropertyCard.css";

function PropertyCard({
  id,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  phoneNumber,
  isFavorite = false,
  onToggleFavorite,
  actions,
}) {
  const { t } = useTranslation();
  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(id);
  }

  return (
    <article className="property-card">
      <div className="property-card-media">
        <img
          className="property-card-image"
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
        />
        {onToggleFavorite && (
          <button
            className={`favorite-button ${
              isFavorite ? "favorite-button-active" : ""
            }`}
            type="button"
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite
                ? t("properties.removeFavorite", { title })
                : t("properties.addFavorite", { title })
            }
            aria-pressed={isFavorite}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
              className={isFavorite ? "favorite-heart active" : "favorite-heart"}
            >
              <path
                d="M12 21s-7-4.35-9.5-8.5C.5 9.5 2 5.5 5.5 4.5 8 3.8 10 5.3 12 7.5c2-2.2 4-3.7 6.5-3 3.5 1 5 5 3 8C19 16.65 12 21 12 21z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="property-card-content">
        <div>
          <h2>{title}</h2>
          <p className="property-location">{location}</p>
        </div>

        <p className="property-price">{price}</p>

        <dl className="property-features" aria-label={t("properties.filters")}>
          <div>
            <dt>{t("details.bedrooms")}</dt>
            <dd>{t("properties.beds", { count: bedrooms })}</dd>
          </div>
          <div>
            <dt>{t("details.bathrooms")}</dt>
            <dd>{t("properties.baths", { count: bathrooms })}</dd>
          </div>
          <div>
            <dt>{t("details.area")}</dt>
            <dd>{t("properties.area", { area })}</dd>
          </div>
        </dl>

        <Link
          className="property-details-link"
          to={`/properties/${id}`}
          aria-label={t("properties.viewDetails")}
        >
          {t("properties.viewDetails")}
        </Link>

        {phoneNumber && (
          <div className="property-card-contact-actions">
            <CallOwnerButton
              className="property-card-contact-button"
              compact
              phoneNumber={phoneNumber}
            />
            <WhatsAppButton
              className="property-card-contact-button"
              phoneNumber={phoneNumber}
            >
              <span aria-hidden="true">💬</span>
              {t("properties.whatsapp")}
            </WhatsAppButton>
          </div>
        )}

        {actions && <div className="property-card-actions">{actions}</div>}
      </div>
    </article>
  );
}

export default PropertyCard;
