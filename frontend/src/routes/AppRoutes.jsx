import { Route, Routes } from "react-router-dom";
import AddProperty from "../pages/AddProperty";
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
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/dashboard" element={<Dashboard favoriteIds={favoriteIds} />} />
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
