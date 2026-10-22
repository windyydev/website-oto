"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, AdminUser } from "@/lib/api";

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = authApi.getToken();
    const cachedUser = authApi.getUser();

    if (token) {
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      }
      // Re-verify with backend in background
      authApi
        .getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("atelier_admin_user", JSON.stringify(fetchedUser));
          }
        })
        .catch(() => {
          // Token expired or invalid
          authApi.logout();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    router.replace("/admin");
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.replace("/admin/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
