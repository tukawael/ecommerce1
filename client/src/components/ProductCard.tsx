import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatPrice, generateStarRating } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@shared/schema";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  // Default value for cart context
  let addToCart = (_productId: number, _quantity: number) => {};
  
  try {
    const cart = useCart();
    addToCart = cart.addToCart;
  } catch (error) {
    console.log('Cart context not available in ProductCard');
  }
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const productUrl = `/products/${product.slug}`;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] group">
      <Link href={productUrl} className="block relative">
        {product.isOnSale && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-destructive to-destructive/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            SALE
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-secondary to-secondary/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NEW
          </div>
        )}
        <div className="overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-56 object-cover p-2 transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
      </Link>
      <div className="p-5 border-t border-neutral-100">
        <Link href={productUrl}>
          <h3 className="font-semibold text-neutral-800 mb-1 text-lg group-hover:text-primary transition-colors duration-200">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-[#F59E0B]">
                  {star <= Math.round(product.rating || 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-sm text-neutral-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              {product.isOnSale && product.salePrice ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm text-neutral-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-neutral-800">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button 
              size="icon"
              className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md hover:shadow-primary/25 transition-all duration-300 hover:scale-110" 
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
