"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferences?: {
    isVietnamese?: boolean;
    useRAG?: boolean;
  }
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken:string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  isVietnamese: boolean;
  setIsVietnamese: (isVietnamese: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVietnamese, setIsVietnamese] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile/");
      setUser(data);
      if (data.preferences?.isVietnamese) {
        setIsVietnamese(true);
      } else {
        setIsVietnamese(false);
      }
    } catch (error) {
      console.error("Failed to fetch profile, logging out.", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    await fetchProfile();
    router.push("/");
  };

  const logout = async () => {
    try {
        await api.post("/auth/logout", {});
    } catch (error) {
        console.error("Failed to logout", error);
    } finally {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        router.push("/auth/login");
    }
  };

  const handleLanguageChange = (isVietnamese: boolean) => {
      setIsVietnamese(isVietnamese);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    fetchProfile,
    isVietnamese,
    setIsVietnamese: handleLanguageChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};