import PropertyCard from "../components/PropertyCard";
import properties from "../data/properties";
import "./Properties.css";

function Properties() {
  return (
    <main className="properties-page">
      <header className="properties-header">
        <h1 id="properties-heading">Featured Properties</h1>
        <p>
          Explore a curated selection of homes designed for comfort, location,
          and long-term value.
        </p>
      </header>

      <section className="properties-grid" aria-labelledby="properties-heading">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </section>
    </main>
  );
}

export default Properties;
