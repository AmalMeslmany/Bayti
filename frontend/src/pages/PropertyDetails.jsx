import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { fetchPropertyById } from "../api/properties";
import { reportProperty } from "../api/reports";
import CallOwnerButton from "../components/CallOwnerButton";
import WhatsAppButton from "../components/WhatsAppButton";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportReason, setReportReason] = useState("Fake Listing");
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        const loadedProperty = await fetchPropertyById(id);
        setProperty(loadedProperty);
        setSelectedImageIndex(0);
      } catch {
        setErrorMessage(t("details.notFoundText"));
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
  }, [id, t]);

  if (isLoading) {
    return (
      <main className="property-details-page">
        <section className="property-not-found">
          <h1>{t("details.loadingTitle")}</h1>
          <p>{t("details.loadingText")}</p>
        </section>
      </main>
    );
  }

  if (errorMessage || !property) {
    return (
      <main className="property-details-page">
        <section className="property-not-found">
          <h1>{t("details.notFoundTitle")}</h1>
          <p>{errorMessage}</p>
        </section>
      </main>
    );
  }

  async function handleReportSubmit(event) {
    event.preventDefault();
    setReportStatus("");
    setIsReporting(true);

    try {
      await reportProperty(property.id, {
        reason: reportReason,
        details: reportDetails,
      });
      setReportDetails("");
      setReportStatus(t("details.reportSuccess"));
    } catch (error) {
      setReportStatus(error.message || t("details.reportFailure"));
    } finally {
      setIsReporting(false);
    }
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
                <dt>{t("details.bedrooms")}</dt>
                <dd>{property.bedrooms}</dd>
              </div>
              <div>
                <dt>{t("details.bathrooms")}</dt>
                <dd>{property.bathrooms}</dd>
              </div>
              <div>
                <dt>{t("details.area")}</dt>
                <dd>{t("properties.area", { area: property.area })}</dd>
              </div>
            </dl>

            <p className="property-description">{property.description}</p>
          </section>

          <aside className="property-contact-card">
            <h2>{t("details.interested")}</h2>
            <p>{t("details.contactText")}</p>
            <Link className="property-contact-button" to="/contact">
              {t("details.contact")}
            </Link>
            {property.phoneNumber && (
              <>
                <p className="property-owner-phone">
                  <span>{t("details.ownerPhone")}</span>
                  {property.phoneNumber}
                </p>
                <div className="property-owner-actions">
                  <CallOwnerButton
                    className="property-contact-button"
                    phoneNumber={property.phoneNumber}
                  />
                  <WhatsAppButton
                    className="property-contact-button"
                    phoneNumber={property.phoneNumber}
                  >
                    {t("details.whatsapp")}
                  </WhatsAppButton>
                </div>
              </>
            )}
          </aside>

          <aside className="property-contact-card">
            <h2>{t("details.reportTitle")}</h2>
            <form className="property-report-form" onSubmit={handleReportSubmit}>
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              >
                <option value="Fake Listing">{t("details.reportReasons.fake")}</option>
                <option value="Inappropriate Images">{t("details.reportReasons.images")}</option>
                <option value="Spam">{t("details.reportReasons.spam")}</option>
                <option value="Wrong Information">{t("details.reportReasons.wrong")}</option>
                <option value="Other">{t("details.reportReasons.other")}</option>
              </select>
              <textarea
                rows="4"
                placeholder={t("details.reportDetails")}
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
              />
              {reportStatus ? <p className="property-report-status">{reportStatus}</p> : null}
              <button className="property-contact-button" type="submit" disabled={isReporting}>
                {isReporting ? t("details.reporting") : t("details.report")}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PropertyDetails;
