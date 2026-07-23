import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPropertyById } from "../api/properties";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProperty() {
      try {
        const loadedProperty = await fetchPropertyById(id);
        setProperty(loadedProperty);
        setSelectedImageIndex(0);
      } catch {
        setErrorMessage(
          "The property you are looking for does not exist or may no longer be available.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (isLoading) {
    return (
      <main className="property-details-page">
        <section className="property-not-found">
          <h1>Loading Property</h1>
          <p>Getting the latest listing details.</p>
        </section>
      </main>
    );
  }

  if (errorMessage || !property) {
    return (
      <main className="property-details-page">
        <section className="property-not-found">
          <h1>Property Not Found</h1>
          <p>{errorMessage}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="property-details-page">
      <div className="property-details-container">
        <div className="property-gallery">
          <img
            className="property-details-image"
            src={property.images[selectedImageIndex]?.url || property.image}
            alt={property.title}
          />
          {property.images.length > 1 && (
            <div className="property-gallery-thumbnails">
              {property.images.map((image, index) => (
                <button
                  className={
                    index === selectedImageIndex
                      ? "property-thumbnail property-thumbnail-active"
                      : "property-thumbnail"
                  }
                  key={image.path || image.url}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image.url} alt={`${property.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

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

