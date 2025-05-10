import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useContext, useCallback } from "react";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import Profile from "@/pages/Profile";
import OrderHistory from "@/pages/OrderHistory";
import NotFound from "@/pages/not-found";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import AuthModal from "@/components/AuthModal";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

function App() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Get auth context
  const authContext = useContext(AuthContext);
  
  // Log auth context for debugging, but only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthContext in App:', {
        context: authContext,
        isContextDefined: authContext !== undefined
      });
    }
  }, [authContext]);

  // Improved checkAuth method that handles non-authenticated users gracefully
  const checkAuth = useCallback(async () => {
    // If no AuthContext is available, wrap with AuthProvider
    if (!authContext?.checkAuth) {
      console.warn('AuthContext not available. Attempting to use fallback mechanism.');
      
      toast({
        title: "Authentication Warning",
        description: "Authentication context not properly initialized. Attempting to recover.",
        variant: "destructive"
      });

      // Fallback mechanism
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Attempt manual token validation
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          throw new Error("Invalid token");
        }

        const userData = await response.json();
        
        // If successful, log a warning about context initialization
        console.warn('Recovered authentication via manual token check', userData);
        
        toast({
          title: "Authentication Recovered",
          description: "Successfully validated your session.",
        });
      } catch (error) {
        console.error('Fallback authentication check failed:', error);
        
        toast({
          title: "Authentication Error",
          description: "Could not validate your session. Please log in again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
      
      return;
    }

    try {
      setIsLoading(true);
      await authContext.checkAuth();
    } catch (error) {
      // Check if this is just a "no token" error, which is expected for non-authenticated users
      const isNoTokenError = error instanceof Error && 
        (error.message.includes('No token') || error.message.includes('token not found'));
      
      if (isNoTokenError) {
        // This is normal for non-authenticated users, just log it as info
        console.info('User not authenticated yet:', error instanceof Error ? error.message : 'Unknown error');
      } else {
        // This is an actual error with authentication
        console.error('Authentication error:', error);
        console.error('Auth Context:', authContext);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Authentication failed';
        
        // Only set auth error for critical failures, not for "no token" cases
        if (!isNoTokenError) {
          setAuthError(errorMessage);
          
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [authContext, toast]);

  // Use effect to trigger initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Error state - only show for critical auth errors
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
        <p className="text-neutral-600 mb-6">{authError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/:slug" component={ProductDetails} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={OrderHistory} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <CartSidebar />
        <AuthModal />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

// Wrap App with both AuthProvider and CartProvider to ensure contexts are always available
export default function WrappedApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
}
