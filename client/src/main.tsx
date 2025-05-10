import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import React, { ErrorInfo } from "react";
import { Toaster } from "./components/ui/toaster";

// Improved error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-fallback flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-red-500 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Context Provider with additional logging and error handling
const ContextProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    console.group('Context Initialization');
    console.log('Mounting context providers');
    return () => {
      console.log('Unmounting context providers');
      console.groupEnd();
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

// Render the application with enhanced context providers
createRoot(document.getElementById("root")!).render(
  <ContextProviders>
    <App />
  </ContextProviders>
);
