import "./Hero.css";
import heroImage from "../assets/bayti-hero.jpg";

function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="hero-content">
        <h1>Find Your Perfect Home with Bayti</h1>
        <p>
          Discover modern properties, trusted listings, and beautiful homes
          designed around the way you want to live.
        </p>

        <div className="hero-actions">
          <button className="hero-button hero-button-primary">
            Browse Properties
          </button>
          <button className="hero-button hero-button-secondary">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
