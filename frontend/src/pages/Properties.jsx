import PropertyCard from "../components/PropertyCard";
import propertyImage from "../assets/bayti-hero.jpg";
import "./Properties.css";

const properties = [
  {
    id: 1,
    image: propertyImage,
    title: "Modern Family Villa",
    location: "Beirut, Lebanon",
    price: "$850,000",
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
  },
  {
    id: 2,
    image: propertyImage,
    title: "Luxury City Apartment",
    location: "Achrafieh, Beirut",
    price: "$420,000",
    bedrooms: 3,
    bathrooms: 2,
    area: 165,
  },
  {
    id: 3,
    image: propertyImage,
    title: "Elegant Mountain Home",
    location: "Broumana, Lebanon",
    price: "$690,000",
    bedrooms: 5,
    bathrooms: 4,
    area: 410,
  },
];

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
