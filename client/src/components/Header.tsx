import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, ShoppingCart, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use the custom hooks instead of direct context
  const { 
    currentUser, 
    isAuthenticated, 
    showAuthModal 
  } = useAuth();
  
  const { 
    cartItems, 
    toggleCart 
  } = useCart();

  const cartItemCount = cartItems?.length || 0;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`bg-white shadow-sm sticky top-0 z-30 transition-shadow ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Top Navigation Bar */}
      <div className="container-custom">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-primary">Shop</span>
              <span className="text-secondary">Ease</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full bg-neutral-100 rounded-lg border-0 py-2 pl-4 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-neutral-400"
              >
                <Search size={18} />
              </Button>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex space-x-6 items-center">
          <div className="relative group">
            <button className="flex items-center text-neutral-600 hover:text-primary">
              Categories
              <ChevronDown size={16} className="ml-1" />
            </button>
            {/* Added padding-top to create a hover bridge between button and dropdown */}
            <div className="absolute z-10 left-0 top-full pt-2">
              {/* Dropdown content wrapped in a div that's shown on group hover */}
              <div className="bg-white rounded-md shadow-lg py-1 w-48 hidden group-hover:block">
                <Link
                  href="/products?category=electronics"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Electronics
                </Link>
                <Link
                  href="/products?category=fashion"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Fashion
                </Link>
                <Link
                  href="/products?category=home-living"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Home & Living
                </Link>
                <Link
                  href="/products?category=beauty"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Beauty
                </Link>
              </div>
            </div>
            </div>
            <Link
              href="/products"
              className="text-sm text-neutral-600 hover:text-primary"
            >
              All Products
            </Link>
            <Link
              href="/products?sale=true"
              className="text-sm text-neutral-600 hover:text-primary"
            >
              Deals
            </Link>
            <button
              onClick={
                isAuthenticated
                  ? () => (window.location.href = "/profile")
                  : showAuthModal
              }
              className="flex items-center text-sm text-neutral-600 hover:text-primary"
            >
              <User size={18} className="mr-1" />
              {isAuthenticated ? currentUser?.username : "Account"}
            </button>
            <button
              onClick={toggleCart}
              className="relative text-neutral-600 hover:text-primary"
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleCart} className="relative text-neutral-600">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-600"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-white border-t border-neutral-200 ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {/* Search Bar (Mobile) */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full bg-neutral-100 rounded-lg border-0 py-2 pl-4 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-neutral-400"
              >
                <Search size={18} />
              </Button>
            </div>
          </div>

          <Link
            href="/products"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            All Products
          </Link>
          <Link
            href="/products?category=electronics"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Electronics
          </Link>
          <Link
            href="/products?category=fashion"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Fashion
          </Link>
          <Link
            href="/products?category=home-living"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Home & Living
          </Link>
          <Link
            href="/products?category=beauty"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Beauty
          </Link>
          <Link
            href="/products?sale=true"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Deals
          </Link>
          <button
            onClick={
              isAuthenticated
                ? () => (window.location.href = "/profile")
                : showAuthModal
            }
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <User size={18} className="inline mr-2" />
            {isAuthenticated ? currentUser?.username : "Account"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
