import React, { createContext, useContext, useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RegisterUser } from "@shared/schema";

type User = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  address?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  logout: () => void;
  showAuthModal: () => void;
  closeAuthModal: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();

  const showAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
    setError(null);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
    }
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await res.json();

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      closeAuthModal();
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to login. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeAuthModal, toast]);

  const register = useCallback(async (data: RegisterUser) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const responseData = await res.json();

      localStorage.setItem("token", responseData.token);
      setToken(responseData.token);
      setUser(responseData.user);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${responseData.user.username}!`,
      });
      
      closeAuthModal();
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Failed to register. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeAuthModal, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
    isAuthModalOpen,
    login,
    register,
    logout,
    showAuthModal,
    closeAuthModal,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
