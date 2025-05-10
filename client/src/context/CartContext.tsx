import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    isOnSale: boolean | null;
    originalPrice: number;
  };
};

export type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items when component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setCartTotal(0);
        return;
      }

      const response = await apiRequest<{ items: CartItem[], total: number }>('/cart', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCartItems(response.items || []);
      setCartTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      // Don't show error for unauthorized - user might not be logged in
      if (error instanceof Error && !error.message.includes('401')) {
        setError('Failed to load cart items');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const addToCart = async (productId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to add items to your cart');
        return;
      }

      await apiRequest('/cart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: { productId, quantity }
      });

      // Refresh cart items after adding
      await fetchCartItems();
      
      // Open cart drawer after adding item
      openCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add item to cart';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to update your cart');
        return;
      }

      // If quantity is 0, remove the item
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      await apiRequest(`/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: { quantity }
      });

      // Refresh cart items after updating
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating cart item:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update cart item';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to remove items from your cart');
        return;
      }

      await apiRequest(`/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Refresh cart items after removing
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove item from cart';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to clear your cart');
        return;
      }

      await apiRequest('/cart', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Clear local cart items
      setCartItems([]);
      setCartTotal(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to clear cart';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        isCartOpen,
        isLoading,
        error,
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

