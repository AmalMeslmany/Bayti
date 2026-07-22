import { useParams } from "react-router-dom";
import properties from "../data/properties";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { id } = useParams();
  const property = properties.find((item) => item.id === Number(id));

  if (!property) {
    return (
      <main className="property-details-page">
        <section className="property-not-found">
          <h1>Property Not Found</h1>
          <p>
            The property you are looking for does not exist or may no longer be
            available.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="property-details-page">
      <div className="property-details-container">
        <img
          className="property-details-image"
          src={property.image}
          alt={property.title}
        />

        <div className="property-details-content">
          <section className="property-details-main">
            <h1>{property.title}</h1>
            <p className="property-details-location">{property.location}</p>
            <p className="property-details-price">{property.price}</p>

            <dl className="property-details-features">
              <div>
                <dt>Bedrooms</dt>
                <dd>{property.bedrooms}</dd>
              </div>
              <div>
                <dt>Bathrooms</dt>
                <dd>{property.bathrooms}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>{property.area} m²</dd>
              </div>
            </dl>

            <p className="property-description">{property.description}</p>
          </section>

          <aside className="property-contact-card">
            <h2>Interested in this property?</h2>
            <p>
              Contact the Bayti team to schedule a viewing or request more
              details about this listing.
            </p>
            <button className="property-contact-button">Contact Us</button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PropertyDetails;
