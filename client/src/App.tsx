import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

function App() {
  // Use a safer way to access auth context
  const authContext = { checkAuth: () => {} };
  
  try {
    const auth = useAuth();
    if (auth && auth.checkAuth) {
      authContext.checkAuth = auth.checkAuth;
    }
  } catch (error) {
    console.log('Auth context not available yet in App');
  }

  useEffect(() => {
    authContext.checkAuth();
  }, [authContext]);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
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
        <CartSidebar />
        <AuthModal />
        <Footer />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
