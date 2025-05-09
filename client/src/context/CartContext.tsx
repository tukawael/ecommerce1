import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type CartProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  isOnSale?: boolean;
  originalPrice?: number;
};

type CartItem = {
  id: number;
  quantity: number;
  product: CartProduct;
};

type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  isCartOpen: boolean;
  isLoading: boolean;
  shippingCost: number;
  toggleCart: () => void;
  addToCart: (productId: number, quantity: number) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  removeCartItem: (itemId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Try to use auth context, but provide fallbacks if not available
  let isAuthenticated = false;
  let token = null;
  let showAuthModal = () => {};
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    token = auth.token;
    showAuthModal = auth.showAuthModal;
  } catch (error) {
    console.log('Auth context not available yet, using defaults');
  }
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const shippingCost = 4.99;

  // Fetch cart data from API if authenticated
  const { 
    data: cartData,
    isLoading: isCartLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/cart", token],
    enabled: isAuthenticated,
    // The queryFn is set in the queryClient configuration
  });

  // Apply defaults for cartData in case it's not available
  const cartItems: CartItem[] = cartData && typeof cartData === 'object' && cartData !== null && 'items' in cartData 
    ? (cartData as any).items 
    : [];
  const cartTotal: number = cartData && typeof cartData === 'object' && cartData !== null && 'total' in cartData 
    ? (cartData as any).total 
    : 0;

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("DELETE", `/api/cart/${itemId}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove item: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/cart", undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const addToCart = useCallback((productId: number, quantity: number) => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    addToCartMutation.mutate({ productId, quantity });
  }, [isAuthenticated, showAuthModal, addToCartMutation]);

  const updateCartItemQuantity = useCallback((itemId: number, quantity: number) => {
    updateCartItemMutation.mutate({ itemId, quantity });
  }, [updateCartItemMutation]);

  const removeCartItem = useCallback((itemId: number) => {
    removeCartItemMutation.mutate(itemId);
  }, [removeCartItemMutation]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  // If there's an error fetching the cart, show a toast
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load your cart. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  const value = {
    cartItems,
    cartTotal,
    isCartOpen,
    isLoading: isCartLoading || addToCartMutation.isPending || updateCartItemMutation.isPending || removeCartItemMutation.isPending || clearCartMutation.isPending,
    shippingCost,
    toggleCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
