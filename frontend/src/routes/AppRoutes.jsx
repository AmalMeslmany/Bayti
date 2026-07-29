import { Route, Routes } from "react-router-dom";
import AddProperty from "../pages/AddProperty";
import AdminDashboard from "../pages/AdminDashboard";
import AdminRoute from "../components/AdminRoute";
import Contact from "../pages/Contact";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import EditProfile from "../pages/EditProfile";
import EditProperty from "../pages/EditProperty";
import Favorites from "../pages/Favorites";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Properties from "../pages/Properties";
import PropertyDetails from "../pages/PropertyDetails";
import Register from "../pages/Register";

function AppRoutes({
  areFavoritesLoading,
  favoriteIds,
  favoriteProperties,
  favoritesError,
  onToggleFavorite,
}) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
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
      <Route
        path="/properties/:id/edit"
        element={
          <ProtectedRoute>
            <EditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-property"
        element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard favoriteIds={favoriteIds} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <Favorites
            areFavoritesLoading={areFavoritesLoading}
            favoriteIds={favoriteIds}
            favoriteProperties={favoriteProperties}
            favoritesError={favoritesError}
            onToggleFavorite={onToggleFavorite}
          />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
