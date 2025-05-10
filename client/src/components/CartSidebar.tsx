import { XIcon, ShoppingCart } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import QuantityControl from "./QuantityControl";
import { useToast } from "@/hooks/use-toast";

const CartSidebar = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Access contexts directly
  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);

  // Early return if contexts are not available
  if (!cartContext || !authContext) {
    return null;
  }

  // Extract available properties from cart context
  // Use optional chaining to safely access properties
  const isCartOpen = cartContext.isCartOpen || false;
  const toggleCart = cartContext.toggleCart || (() => {});
  const cartItems = cartContext.cartItems || [];
  const cartTotal = cartContext.cartTotal || 0;
  
  // Check if these methods exist in your CartContext
  const addToCart = cartContext.addToCart;
  
  // Default shipping cost
  const shippingCost = 4.99;

  const { isAuthenticated, showAuthModal } = authContext;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toggleCart();
      showAuthModal();
      return;
    }
    
    toggleCart();
    navigate("/checkout");
  };

  // Use the methods that are actually available in your CartContext
  // This is a workaround if updateCartItemQuantity doesn't exist
  const handleUpdateQuantity = useCallback((id: number, quantity: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to modify cart",
        variant: "destructive"
      });
      toggleCart();
      showAuthModal();
      return;
    }
    
    // Check which methods are available in your CartContext
    if (typeof cartContext.addToCart === 'function') {
      // If you have a method to update quantity directly, use it
      // Otherwise, you might need to remove and add again with new quantity
      const item = cartItems.find(item => item.id === id);
      if (item && item.product) {
        // This is a workaround - you may need to adjust based on your actual API
        cartContext.addToCart(item.product.id, quantity);
      }
    } else {
      toast({
        title: "Cart Error",
        description: "Unable to update quantity. Method not available.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, cartContext, cartItems, toast, toggleCart, showAuthModal]);

  const handleRemoveItem = useCallback((id: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to modify cart",
        variant: "destructive"
      });
      toggleCart();
      showAuthModal();
      return;
    }
    
    // Check which methods are available in your CartContext for removing items
    if (typeof cartContext.removeFromCart === 'function') {
      cartContext.removeFromCart(id);
    } else if (typeof cartContext.addToCart === 'function') {
      // If there's no direct remove method, try setting quantity to 0
      const item = cartItems.find(item => item.id === id);
      if (item && item.product) {
        cartContext.addToCart(item.product.id, 0);
      }
    } else {
      toast({
        title: "Cart Error",
        description: "Unable to remove item. Method not available.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, cartContext, cartItems, toast, toggleCart, showAuthModal]);

  const renderCartItems = () => {
    if (!cartItems || cartItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
          <ShoppingCart size={64} className="text-neutral-300 mb-4" />
          <p className="text-neutral-500">Your cart is empty</p>
        </div>
      );
    }

    return cartItems.map((item) => (
      <div 
        key={item.id} 
        className="flex items-center py-4 border-b"
      >
        <img 
          src={item.product.imageUrl} 
          alt={item.product.name} 
          className="w-16 h-16 object-contain mr-4" 
        />
        <div className="flex-1">
          <h3 className="font-medium text-neutral-800">{item.product.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <QuantityControl 
              quantity={item.quantity}
              onIncrease={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              onDecrease={() => {
                if (item.quantity > 1) {
                  handleUpdateQuantity(item.id, item.quantity - 1);
                }
              }}
            />
            <div className="text-right">
              <span className="font-bold">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleRemoveItem(item.id)}
          className="ml-2 text-neutral-400 hover:text-destructive"
        >
          <XIcon size={16} />
        </Button>
      </div>
    ));
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      ></div>
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            Your Cart 
            {cartItems.length > 0 && <span className="ml-2">({cartItems.length})</span>}
          </h2>
          <Button variant="ghost" size="icon" onClick={toggleCart} className="text-neutral-500 hover:text-neutral-800">
            <XIcon />
          </Button>
        </div>
        
        {renderCartItems()}

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-neutral-200">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Estimated Shipping</span>
              <span className="font-bold">{formatPrice(shippingCost)}</span>
            </div>
            <Separator className="mb-4" />
            <div className="flex justify-between text-lg mb-6">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatPrice(cartTotal + shippingCost)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition duration-150 mb-3"
            >
              Checkout
            </Button>
            <Button 
              onClick={toggleCart}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
