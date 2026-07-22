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
}) {
  return (
    <article className="property-card">
      <img
        className="property-card-image"
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
      />

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
      </div>
    </article>
  );
}

export default PropertyCard;
