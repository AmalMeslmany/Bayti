import PropertyCard from "../components/PropertyCard";
import properties from "../data/properties";
import "./Dashboard.css";

const dashboardProperties = properties.slice(0, 2);

function Dashboard({ favoriteIds }) {
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
          <p>Temporary sample listings for the dashboard interface.</p>
        </header>

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
      </section>
    </main>
  );
}

export default Dashboard;
