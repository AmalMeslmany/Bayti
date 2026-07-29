import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchFavorites } from "../api/favorites";
import { fetchProperties } from "../api/properties";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

function Profile() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const [propertyCount, setPropertyCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [countsError, setCountsError] = useState("");
  const fullName = `${user.firstName} ${user.lastName}`;
  const avatarLetter = user.firstName?.charAt(0).toUpperCase() || "B";

  useEffect(() => {
    let isActive = true;

    async function loadProfileCounts() {
      setIsLoadingCounts(true);
      setCountsError("");

      try {
        const [properties, favorites] = await Promise.all([
          fetchProperties(),
          fetchFavorites(token),
        ]);
        const userProperties = properties.filter((property) => {
          const ownerId = property.owner?._id || property.owner?.id;
          return ownerId === user.id;
        });

        if (isActive) {
          setPropertyCount(userProperties.length);
          setFavoriteCount(favorites.length);
        }
      } catch {
        if (isActive) {
          setPropertyCount(0);
          setFavoriteCount(0);
          setCountsError(t("profile.countsError"));
        }
      } finally {
        if (isActive) {
          setIsLoadingCounts(false);
        }
      }
    }

    loadProfileCounts();

    return () => {
      isActive = false;
    };
  }, [t, token, user.id]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="profile-page">
      <section className="profile-card" aria-labelledby="profile-heading">
        {user.profileImage ? (
          <img
            className="profile-avatar profile-avatar-image"
            src={user.profileImage}
            alt={t("profile.avatarAlt")}
          />
        ) : (
          <div className="profile-avatar" aria-hidden="true">
            {avatarLetter}
          </div>
        )}

        <h1 id="profile-heading">{fullName}</h1>
        <p className="profile-email">{user.email}</p>

        <section className="profile-stats" aria-label={t("profile.statsLabel")}>
          <article className="profile-stat">
            <span>{t("profile.myProperties")}</span>
            <strong>{isLoadingCounts ? "..." : propertyCount}</strong>
          </article>
          <article className="profile-stat">
            <span>{t("profile.favorites")}</span>
            <strong>{isLoadingCounts ? "..." : favoriteCount}</strong>
          </article>
        </section>

        {isLoadingCounts && (
          <p className="profile-status">{t("profile.loadingStats")}</p>
        )}
        {countsError && <p className="profile-error">{countsError}</p>}
        {location.state?.message && (
          <p className="profile-status">{location.state.message}</p>
        )}

        <div className="profile-actions">
          <Link className="profile-button" to="/profile/edit">
            {t("profile.editProfile")}
          </Link>
          <Link className="profile-button" to="/dashboard">
            {t("profile.myProperties")}
          </Link>
          <button
            className="profile-button profile-button-danger"
            type="button"
            onClick={handleLogout}
          >
            {t("profile.logout")}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
