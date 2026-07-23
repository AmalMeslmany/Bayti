import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFavorite, fetchFavorites, removeFavorite } from "./api/favorites";
import "./App.css";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/useAuth";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [favoritesError, setFavoritesError] = useState("");
  const [areFavoritesLoading, setAreFavoritesLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadFavorites() {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        setFavoriteProperties([]);
        return;
      }

      setAreFavoritesLoading(true);
      setFavoritesError("");

      try {
        const loadedFavorites = await fetchFavorites(token);

        if (isActive) {
          setFavoriteProperties(loadedFavorites);
          setFavoriteIds(loadedFavorites.map((property) => property.id));
        }
      } catch (error) {
        if (isActive) {
          setFavoritesError(error.message);
        }
      } finally {
        if (isActive) {
          setAreFavoritesLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, token]);

  async function toggleFavorite(propertyId) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const isFavorite = favoriteIds.includes(propertyId);

    setFavoritesError("");
    setFavoriteIds((currentFavoriteIds) =>
      isFavorite
        ? currentFavoriteIds.filter((id) => id !== propertyId)
        : [...currentFavoriteIds, propertyId],
    );

    try {
      if (isFavorite) {
        await removeFavorite(propertyId, token);
        setFavoriteProperties((currentProperties) =>
          currentProperties.filter((property) => property.id !== propertyId),
        );
      } else {
        const updatedFavorites = await addFavorite(propertyId, token);
        setFavoriteProperties(updatedFavorites);
        setFavoriteIds(updatedFavorites.map((property) => property.id));
      }
    } catch (error) {
      setFavoritesError(error.message);
      const loadedFavorites = await fetchFavorites(token);
      setFavoriteProperties(loadedFavorites);
      setFavoriteIds(loadedFavorites.map((property) => property.id));
    }
  }

  return (
    <>
      <Navbar />
      <AppRoutes
        areFavoritesLoading={areFavoritesLoading}
        favoriteIds={favoriteIds}
        favoriteProperties={favoriteProperties}
        favoritesError={favoritesError}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
}

export default App;
