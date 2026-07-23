import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProperty, fetchProperties } from "../api/properties";
import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/useAuth";
import "./Dashboard.css";

function Dashboard({ favoriteIds }) {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProperties() {
      try {
        const loadedProperties = await fetchProperties();
        const userProperties = loadedProperties.filter((property) => {
          const ownerId = property.owner?._id || property.owner?.id;
          return ownerId === user.id || property.owner?.email === user.email;
        });

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
  }, [user.email, user.id]);

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
          <p className="dashboard-eyebrow">User Dashboard</p>
          <h1>Welcome back to Bayti</h1>
          <p>
            Manage your property activity, review saved homes, and keep track of
            new messages from one place.
          </p>
        </div>
      </section>

      <section className="dashboard-summary" aria-label="Dashboard summary">
        <article className="dashboard-summary-card">
          <span>My Properties</span>
          <strong>{properties.length}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>Favorites</span>
          <strong>{favoriteIds.length}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>Messages</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="dashboard-section">
        <header className="dashboard-section-header">
          <h2>My Properties</h2>
          <p>Your latest property listings.</p>
        </header>

        {isLoading && <p className="dashboard-empty">Loading properties...</p>}

        {errorMessage && <p className="dashboard-empty">{errorMessage}</p>}

        {!isLoading && !errorMessage && properties.length > 0 && (
          <div className="dashboard-properties-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                actions={
                  <div className="dashboard-card-actions">
                    <Link to={`/properties/${property.id}/edit`}>Edit</Link>
                    <button
                      type="button"
                      className="dashboard-delete-button"
                      disabled={deletingPropertyId === property.id}
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      {deletingPropertyId === property.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && properties.length === 0 && (
          <p className="dashboard-empty">No properties available yet.</p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
