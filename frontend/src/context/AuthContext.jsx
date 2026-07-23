import { useEffect, useMemo, useState } from "react";
import { fetchAuthenticatedUser, loginUser } from "../api/auth";
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

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      if (!auth.token) {
        return;
      }

      try {
        const data = await fetchAuthenticatedUser(auth.token);
        const nextAuth = {
          token: auth.token,
          user: data.user,
        };

        if (isActive) {
          localStorage.setItem(storageKey, JSON.stringify(nextAuth));
          setAuth(nextAuth);
        }
      } catch {
        if (isActive) {
          localStorage.removeItem(storageKey);
          setAuth({ token: "", user: null });
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [auth.token]);

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
