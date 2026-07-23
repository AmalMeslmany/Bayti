import { Link } from "react-router-dom";
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
  isFavorite = false,
  onToggleFavorite,
  actions,
}) {
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
            onClick={() => onToggleFavorite(id)}
            aria-label={
              isFavorite
                ? `Remove ${title} from favorites`
                : `Add ${title} to favorites`
            }
            aria-pressed={isFavorite}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
            >
              <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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

        <dl className="property-features" aria-label="Property features">
          <div>
            <dt>Bedrooms</dt>
            <dd>{bedrooms} Beds</dd>
          </div>
          <div>
            <dt>Bathrooms</dt>
            <dd>{bathrooms} Baths</dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>{area} m²</dd>
          </div>
        </dl>

        <Link
          className="property-details-link"
          to={`/properties/${id}`}
          aria-label={`View details for ${title}`}
        >
          View Details
        </Link>

        {actions && <div className="property-card-actions">{actions}</div>}
      </div>
    </article>
  );
}

export default PropertyCard;

