import { XIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import QuantityControl from "./QuantityControl";

const CartSidebar = () => {
  // Default values in case context is not available
  let isCartOpen = false;
  let toggleCart = () => {};
  let cartItems: any[] = [];
  let cartTotal = 0;
  let updateCartItemQuantity = (_id: number, _quantity: number) => {};
  let removeCartItem = (_id: number) => {};
  let shippingCost = 4.99;

  let isAuthenticated = false;
  let showAuthModal = () => {};
  
  try {
    const cart = useCart();
    isCartOpen = cart.isCartOpen;
    toggleCart = cart.toggleCart;
    cartItems = cart.cartItems;
    cartTotal = cart.cartTotal;
    updateCartItemQuantity = cart.updateCartItemQuantity;
    removeCartItem = cart.removeCartItem;
    shippingCost = cart.shippingCost;
  } catch (error) {
    console.log('Cart context not available in CartSidebar');
  }
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    showAuthModal = auth.showAuthModal;
  } catch (error) {
    console.log('Auth context not available in CartSidebar');
  }
  
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toggleCart();
      showAuthModal();
      return;
    }
    
    toggleCart();
    navigate("/checkout");
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
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
            <ShoppingCart size={64} className="text-neutral-300 mb-4" />
            <h3 className="text-xl font-medium text-neutral-700 mb-2">Your cart is empty</h3>
            <p className="text-neutral-500 mb-6 text-center max-w-xs">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button onClick={toggleCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto p-4 h-[calc(100vh-180px)]">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b">
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
                        onIncrease={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        onDecrease={() => {
                          if (item.quantity > 1) {
                            updateCartItemQuantity(item.id, item.quantity - 1);
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
                    onClick={() => removeCartItem(item.id)}
                    className="ml-2 text-neutral-400 hover:text-destructive"
                  >
                    <XIcon size={16} />
                  </Button>
                </div>
              ))}
            </div>
            
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
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
