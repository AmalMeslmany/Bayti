import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { deleteProperty, fetchMyProperties } from "../api/properties";
import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/useAuth";
import "./Dashboard.css";

function Dashboard({ favoriteIds }) {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProperties() {
      try {
        const userProperties = await fetchMyProperties(token);

        if (isActive) {
          setProperties(userProperties);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      isActive = false;
    };
  }, [token, user.id]);

  async function handleDeleteProperty(propertyId) {
    setDeletingPropertyId(propertyId);
    setErrorMessage("");

    try {
      await deleteProperty(propertyId, token);
      setProperties((currentProperties) =>
        currentProperties.filter((property) => property.id !== propertyId),
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setDeletingPropertyId("");
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">{t("dashboard.eyebrow")}</p>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
      </section>

      <section className="dashboard-summary" aria-label={t("dashboard.summary")}>
        <article className="dashboard-summary-card">
          <span>{t("dashboard.myProperties")}</span>
          <strong>{properties.length}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>{t("dashboard.favorites")}</span>
          <strong>{favoriteIds.length}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>{t("dashboard.messages")}</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="dashboard-section">
        <header className="dashboard-section-header">
          <h2>{t("dashboard.sectionTitle")}</h2>
          <p>{t("dashboard.sectionSubtitle")}</p>
        </header>

        {isLoading && <p className="dashboard-empty">{t("dashboard.loading")}</p>}

        {errorMessage && <p className="dashboard-empty">{errorMessage}</p>}

        {!isLoading && !errorMessage && properties.length > 0 && (
          <div className="dashboard-properties-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                actions={
                  <div className="dashboard-card-actions">
                    {property.isHidden ? (
                      <span className="dashboard-hidden-badge">
                        {t("dashboard.hiddenByAdmin")}
                      </span>
                    ) : null}
                    <Link to={`/properties/${property.id}/edit`}>
                      {t("dashboard.edit")}
                    </Link>
                    <button
                      type="button"
                      className="dashboard-delete-button"
                      disabled={deletingPropertyId === property.id}
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      {deletingPropertyId === property.id
                        ? t("dashboard.deleting")
                        : t("dashboard.delete")}
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && properties.length === 0 && (
          <p className="dashboard-empty">{t("dashboard.empty")}</p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
