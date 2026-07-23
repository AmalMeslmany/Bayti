import { useMemo, useState } from "react";
import { loginUser } from "../api/auth";
import AuthContext from "./authContext";

const storageKey = "bayti_auth";

function getStoredAuth() {
  try {
    const storedAuth = localStorage.getItem(storageKey);
    return storedAuth ? JSON.parse(storedAuth) : { token: "", user: null };
  } catch {
    localStorage.removeItem(storageKey);
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);

  async function login(credentials) {
    const data = await loginUser(credentials);
    const nextAuth = {
      token: data.token,
      user: data.user,
    };

    localStorage.setItem(storageKey, JSON.stringify(nextAuth));
    setAuth(nextAuth);

    return data.user;
  }

  function logout() {
    localStorage.removeItem(storageKey);
    setAuth({ token: "", user: null });
  }

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      login,
      logout,
      isAuthenticated: Boolean(auth.token && auth.user),
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
