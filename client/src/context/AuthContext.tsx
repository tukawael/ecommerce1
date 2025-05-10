import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define types for authentication context
export type User = {
  id: number;
  username: string;
  email: string;
};

export type AuthContextType = {
  currentUser: User | null;
  currentToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  showAuthModal: () => void;
  closeAuthModal: () => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<string>; // Changed from Promise<void> to Promise<string>
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check authentication status using useCallback
  const checkAuth = useCallback(async () => {
    // Don't check if we already have a user and token
    if (currentUser && currentToken) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        resetAuthentication();
        setIsLoading(false);
        return;
      }
      
      setCurrentToken(token);
      
      // Make API request to verify token
      const user = await apiRequest<User>('/users/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCurrentUser(user);
    } catch (error) {
      resetAuthentication();
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentToken]);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Reset authentication state
  const resetAuthentication = () => {
    setCurrentUser(null);
    setCurrentToken(null);
    localStorage.removeItem('token');
  };

  // Show authentication modal
  const showAuthModal = () => {
    setIsAuthModalOpen(true);
    setError(null);
  };

  // Close authentication modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  // Login handler
  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{ user: User; token: string }>(
        '/auth/login', 
        { 
          method: 'POST', 
          body: {
            username: credentials.username,
            password: credentials.password
          }
        }
      );
      const { user, token } = response;
      
      // Set user and token directly from login response
      setCurrentUser(user);
      setCurrentToken(token);
      localStorage.setItem('token', token);
      
      closeAuthModal();
    } catch (error) {
      resetAuthentication();
    } finally {
      setIsLoading(false);
    }
  };
  // Registration handler
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    if (userData.password !== userData.confirmPassword) {
      const errorMessage = "Passwords do not match";
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
    
    try {
      const response = await apiRequest<{ user: User; message: string }>(
        '/auth/register', 
        { 
          method: 'POST', 
          body: {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.confirmPassword
          }
        }
      );
      
      // Close the modal without setting user or token
      closeAuthModal();
      
      // Return the success message
      return response.message || "Registration successful. Please login to continue.";
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.status === 409) {
          errorMessage = 'Username or email already exists';
        } else if (errorObj.status === 400) {
          errorMessage = 'Invalid registration data';
        } else if (errorObj.status === 500) {
          errorMessage = 'Server error during registration';
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    resetAuthentication();
    // Removed navigation logic - this will be handled by the component using this context
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        
        currentToken, 
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        isAuthModalOpen,
        showAuthModal,
        closeAuthModal,
        login, 
        register, 
        logout,
        checkAuth 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
