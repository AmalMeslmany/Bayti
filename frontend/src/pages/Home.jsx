import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchProperties } from "../api/properties";
import Hero from "../components/Hero";
import "./Home.css";

function FeatureIcon({ type }) {
  const iconProps = {
    "aria-hidden": "true",
    className: "home-feature-svg",
    fill: "none",
    height: "30",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
    viewBox: "0 0 24 24",
    width: "30",
  };

  const icons = {
    verified: (
      <svg {...iconProps}>
        <path d="M20 13c0 5-3.5 7.5-7.6 8.9a1.2 1.2 0 0 1-.8 0C7.5 20.5 4 18 4 13V5.8a1 1 0 0 1 .8-1c2.3-.4 4.5-1.3 6.4-2.6a1.4 1.4 0 0 1 1.6 0c1.9 1.3 4.1 2.2 6.4 2.6a1 1 0 0 1 .8 1V13Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    secure: (
      <svg {...iconProps}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
    search: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
    ),
    management: (
      <svg {...iconProps}>
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
      </svg>
    ),
    responsive: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="13" height="10" rx="2" />
        <rect x="17" y="10" width="4" height="8" rx="1" />
        <path d="M8 20h4" />
        <path d="M10 14v6" />
      </svg>
    ),
    experience: (
      <svg {...iconProps}>
        <path d="M12 3 10.4 8.4 5 10l5.4 1.6L12 17l1.6-5.4L19 10l-5.4-1.6L12 3Z" />
        <path d="M19 15 18.2 17.2 16 18l2.2.8L19 21l.8-2.2L22 18l-2.2-.8L19 15Z" />
        <path d="M5 3 4.4 4.4 3 5l1.4.6L5 7l.6-1.4L7 5l-1.4-.6L5 3Z" />
      </svg>
    ),
  };

  return icons[type] || null;
}

function isExternalUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function Home() {
  const { t } = useTranslation();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socialLinks = [
    { label: "Facebook", url: import.meta.env.VITE_SOCIAL_FACEBOOK_URL },
    { label: "Instagram", url: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL },
    { label: "LinkedIn", url: import.meta.env.VITE_SOCIAL_LINKEDIN_URL },
    { label: "X", url: import.meta.env.VITE_SOCIAL_X_URL },
  ].filter((socialLink) => isExternalUrl(socialLink.url));

  useEffect(() => {
    let isActive = true;

    async function loadFeaturedProperties() {
      try {
        const properties = await fetchProperties();

        if (isActive) {
          setFeaturedProperties(properties.slice(0, 6));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadFeaturedProperties();

    return () => {
      isActive = false;
    };
  }, []);

  const features = [
    "verified",
    "secure",
    "search",
    "management",
    "responsive",
    "experience",
  ];

  return (
    <>
      <Hero />

      <section className="home-section">
        <header className="home-section-header">
          <h2>{t("home.featuredTitle")}</h2>
          <p>{t("home.featuredSubtitle")}</p>
        </header>

        {isLoading && <p className="home-empty">{t("properties.loading")}</p>}

        {!isLoading && featuredProperties.length > 0 && (
          <div className="home-properties-grid">
            {featuredProperties.map((property) => (
              <article className="home-property-card" key={property.id}>
                <img src={property.image} alt={property.title} />
                <div>
                  <h3>{property.title}</h3>
                  <p className="home-property-price">{property.price}</p>
                  <p className="home-property-location">{property.location}</p>
                  <span>{property.propertyType || t("home.defaultType")}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && featuredProperties.length === 0 && (
          <p className="home-empty">{t("properties.empty")}</p>
        )}

        <div className="home-section-action">
          <Link className="home-button" to="/properties">
            {t("home.viewAll")}
          </Link>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <header className="home-section-header">
          <h2>{t("home.whyTitle")}</h2>
          <p>{t("home.whySubtitle")}</p>
        </header>
        <div className="home-feature-grid">
          {features.map((feature) => (
            <article className="home-feature-card" key={feature}>
              <span className="home-feature-icon" aria-hidden="true">
                <FeatureIcon type={feature} />
              </span>
              <h3>{t(`home.features.${feature}.title`)}</h3>
              <p>{t(`home.features.${feature}.text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h2>{t("home.ctaTitle")}</h2>
          <p>{t("home.ctaText")}</p>
        </div>
        <Link className="home-button home-button-dark" to="/contact">
          {t("home.ctaButton")}
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <section>
            <h2>Bayti</h2>
            <p>{t("footer.description")}</p>
          </section>
          <section>
            <h3>{t("footer.quickLinks")}</h3>
            <Link to="/">{t("nav.home")}</Link>
            <Link to="/properties">{t("nav.properties")}</Link>
            <Link to="/contact">{t("footer.contact")}</Link>
          </section>
          <section>
            <h3>{t("footer.contactInfo")}</h3>
            <p>{t("footer.ownerName")}</p>
            <p>
              <a href={`mailto:${t("footer.emailAddress")}`}>
                {t("footer.emailAddress")}
              </a>
            </p>
            <p>{t("footer.officeLocation")}</p>
          </section>
          {socialLinks.length > 0 ? (
            <section>
              <h3>{t("footer.social")}</h3>
              <div className="footer-social">
                {socialLinks.map((socialLink) => (
                  <a
                    href={socialLink.url}
                    key={socialLink.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {socialLink.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <p className="footer-credit">{t("footer.developerCredit")}</p>
        <p className="footer-copy">{t("footer.copy")}</p>
      </footer>
    </>
  );
}

export default Home;
