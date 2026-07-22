import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [favoriteIds, setFavoriteIds] = useState([]);

  function toggleFavorite(propertyId) {
    setFavoriteIds((currentFavoriteIds) => {
      if (currentFavoriteIds.includes(propertyId)) {
        return currentFavoriteIds.filter((id) => id !== propertyId);
      }

      return [...currentFavoriteIds, propertyId];
    });
  }

  return (
    <>
      <Navbar />
      <AppRoutes favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
    </>
  );
}

export default App;
