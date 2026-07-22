import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Favorites from "../pages/Favorites";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Properties from "../pages/Properties";
import PropertyDetails from "../pages/PropertyDetails";
import Register from "../pages/Register";

function AppRoutes({ favoriteIds, onToggleFavorite }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/properties"
        element={
          <Properties
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        }
      />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/favorites"
        element={
          <Favorites
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default AppRoutes;
