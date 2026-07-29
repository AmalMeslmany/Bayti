import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Hero.css";
import heroImage from "../assets/bayti-hero.jpg";

function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="hero-content">
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.subtitle")}</p>

        <div className="hero-actions">
          <Link className="hero-button hero-button-primary" to="/properties">
            {t("hero.browse")}
          </Link>
          <Link className="hero-button hero-button-secondary" to="/contact">
            {t("hero.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
