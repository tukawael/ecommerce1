import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductWithCategory } from "@shared/schema";
import { formatPrice, generateStarRating } from "@/lib/utils";
import QuantityControl from "@/components/QuantityControl";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

const ProductDetails = () => {
  const { slug } = useParams();
  
  // Default values for cart context
  let addToCart = (_productId: number, _quantity: number) => {};
  let isCartLoading = false;
  
  try {
    const cart = useCart();
    addToCart = cart.addToCart;
    isCartLoading = cart.isLoading;
  } catch (error) {
    console.log('Cart context not available in ProductDetails');
  }
  
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { 
    data: product,
    isLoading,
    isError,
    error
  } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-10 w-32 mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container-custom py-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Product Not Found</h2>
        <p className="text-neutral-600 mb-6">
          Sorry, the product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const displayPrice = product.isOnSale && product.salePrice 
    ? product.salePrice 
    : product.price;

  return (
    <>
      <Helmet>
        <title>{`${product.name} | ShopEase`}</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        <meta property="og:title" content={`${product.name} | ShopEase`} />
        <meta property="og:description" content={product.description.slice(0, 160)} />
        <meta property="og:image" content={product.imageUrl} />
        <meta property="og:type" content="product" />
      </Helmet>
    
      <div className="container-custom py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="hover:bg-transparent p-0">
            <Link href="/products" className="flex items-center text-neutral-600 hover:text-primary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-8 flex items-center justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-h-[400px] object-contain"
            />
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-accent mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-[#F59E0B]">
                    {star <= Math.round(product.rating || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-sm text-neutral-500">
                ({product.reviewCount || 0} reviews)
              </span>
              
              {product.category && (
                <Badge variant="secondary" className="ml-4">
                  {product.category.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-end mb-6">
              <span className="text-3xl font-bold text-neutral-800 mr-3">
                {formatPrice(displayPrice)}
              </span>
              
              {product.isOnSale && product.salePrice && (
                <span className="text-xl text-neutral-500 line-through mb-0.5">
                  {formatPrice(product.price)}
                </span>
              )}
              
              {product.isOnSale && (
                <span className="ml-3 bg-destructive text-white text-sm font-bold px-2 py-1 rounded">
                  SALE
                </span>
              )}
              
              {product.isNew && (
                <span className="ml-3 bg-secondary text-white text-sm font-bold px-2 py-1 rounded">
                  NEW
                </span>
              )}
            </div>
            
            <Tabs defaultValue="description" className="mb-6">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="text-neutral-600 mt-4">
                <p>{product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="text-neutral-600 mt-4">
                <ul className="space-y-2">
                  <li>
                    <span className="font-semibold">Availability:</span>{" "}
                    {product.stock > 0 ? (
                      <span className="text-secondary">In Stock ({product.stock} available)</span>
                    ) : (
                      <span className="text-destructive">Out of Stock</span>
                    )}
                  </li>
                  <li>
                    <span className="font-semibold">Category:</span>{" "}
                    {product.category?.name || "Uncategorized"}
                  </li>
                  <li>
                    <span className="font-semibold">SKU:</span> PROD-{product.id}
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
            
            <div className="border-t border-b py-6 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="mb-2 text-neutral-600">Quantity:</p>
                  <QuantityControl 
                    quantity={quantity}
                    onIncrease={() => setQuantity(prev => prev + 1)}
                    onDecrease={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                    onChangeQuantity={setQuantity}
                  />
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 h-12"
                  disabled={isCartLoading || product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
