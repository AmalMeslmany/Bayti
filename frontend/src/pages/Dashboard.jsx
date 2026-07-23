import { useEffect, useState } from "react";
import { fetchProperties } from "../api/properties";
import PropertyCard from "../components/PropertyCard";
import "./Dashboard.css";

function Dashboard({ favoriteIds }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const dashboardProperties = properties.slice(0, 2);

  useEffect(() => {
    async function loadProperties() {
      try {
        const loadedProperties = await fetchProperties();
        setProperties(loadedProperties);
      } catch {
        setErrorMessage("Unable to load dashboard properties right now.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProperties();
  }, []);

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

        {!isLoading && !errorMessage && dashboardProperties.length > 0 && (
          <div className="dashboard-properties-grid">
            {dashboardProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                actions={
                  <div className="dashboard-card-actions">
                    <button type="button">Edit</button>
                    <button type="button" className="dashboard-delete-button">
                      Delete
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && dashboardProperties.length === 0 && (
          <p className="dashboard-empty">No properties available yet.</p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
