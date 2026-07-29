import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { i18n, t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const nextLanguage = i18n.language === "ar" ? "en" : "ar";

  function handleLanguageChange() {
    i18n.changeLanguage(nextLanguage);
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        Bayti
      </NavLink>

      <ul className="navbar-links">
        <li>
          <NavLink to="/">{t("nav.home")}</NavLink>
        </li>
        <li>
          <NavLink to="/properties">{t("nav.properties")}</NavLink>
        </li>
        <li>
          <NavLink to="/add-property">{t("nav.addProperty")}</NavLink>
        </li>
        <li>
          <NavLink to="/favorites">{t("nav.favorites")}</NavLink>
        </li>
        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/login">{t("nav.login")}</NavLink>
            </li>
            <li>
              <NavLink to="/register">{t("nav.register")}</NavLink>
            </li>
          </>
        )}
        {isAuthenticated && (
          <>
            <li>
              <NavLink to="/profile">{t("nav.profile")}</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard">{t("nav.dashboard")}</NavLink>
            </li>
            {user.role === "admin" && (
              <li>
                <NavLink to="/admin">{t("nav.adminDashboard")}</NavLink>
              </li>
            )}
            <li className="navbar-user">
              {t("nav.greeting", { name: user.firstName })}
            </li>
            <li>
              <button className="navbar-logout" type="button" onClick={logout}>
                {t("nav.logout")}
              </button>
            </li>
          </>
        )}
        <li>
          <button
            className="navbar-logout"
            type="button"
            onClick={handleLanguageChange}
          >
            {t("nav.language")}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
