import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        Bayti
      </NavLink>

      <ul className="navbar-links">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/properties">Properties</NavLink>
        </li>
        <li>
          <NavLink to="/add-property">Add Property</NavLink>
        </li>
        <li>
          <NavLink to="/favorites">Favorites</NavLink>
        </li>
        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/register">Register</NavLink>
            </li>
          </>
        )}
        {isAuthenticated && (
          <>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li className="navbar-user">Hi, {user.firstName}</li>
            <li>
              <button className="navbar-logout" type="button" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
