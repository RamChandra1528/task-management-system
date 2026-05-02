import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi, setAuthToken } from "../lib/api.js";

const AuthContext = createContext(null);

const storageKey = "taskpro.token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const payload = await authApi.me();
        setUser(payload.user);
        setWorkspace(payload.workspace);
        setUnreadNotifications(payload.unreadNotifications || 0);
      } catch {
        localStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function handleAuth(callback, payload) {
    const response = await callback(payload);
    localStorage.setItem(storageKey, response.token);
    setToken(response.token);
    setUser(response.user);
    setWorkspace(response.workspace);
    setUnreadNotifications(response.unreadNotifications || 0);
    return response;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      workspace,
      loading,
      unreadNotifications,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      login: (payload) => handleAuth(authApi.login, payload),
      signup: (payload) => handleAuth(authApi.signup, payload),
      logout: async () => {
        try {
          if (token) {
            await authApi.logout();
          }
        } catch {
          // The session should still be cleared if the token is already invalidated.
        } finally {
          localStorage.removeItem(storageKey);
          setToken(null);
          setUser(null);
          setWorkspace(null);
          setUnreadNotifications(0);
          setAuthToken(null);
        }
      },
      replaceSession: (payload) => {
        setUser(payload.user);
        setWorkspace(payload.workspace);
        setUnreadNotifications(payload.unreadNotifications || 0);
      },
      setUnreadNotifications
    }),
    [token, user, workspace, loading, unreadNotifications]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
