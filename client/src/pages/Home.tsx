import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/HeroBanner";
import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import Newsletter from "@/components/Newsletter";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Category, Product } from "@shared/schema";
import { Helmet } from "react-helmet";

const Home = () => {
  // Fetch categories
  const { 
    data: categories,
    isLoading: isCategoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch products
  const { 
    data: products,
    isLoading: isProductsLoading 
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Prepare featured products and best sellers
  const featuredProducts = products
    ? products.filter(p => p.isOnSale || p.isNew).slice(0, 4)
    : [];
    
  const bestSellers = products
    ? [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 4)
    : [];

  return (
    <>
      <Helmet>
        <title>ShopEase - Modern E-Commerce Store</title>
        <meta name="description" content="Discover the latest trends in electronics, fashion, home goods and more. Shop our wide selection of products with free shipping on orders over $50." />
        <meta property="og:title" content="ShopEase - Modern E-Commerce Store" />
        <meta property="og:description" content="Discover the latest trends in electronics, fashion, home goods and more with amazing deals and fast shipping." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroBanner />
      
      {/* Categories */}
      <section className="container-custom py-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isCategoriesLoading
            ? Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
                  <div className="w-full h-48 mb-4 bg-neutral-200 animate-pulse"></div>
                  <div className="h-5 w-24 mx-auto bg-neutral-200 animate-pulse"></div>
                </div>
              ))
            : categories?.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
          }
        </div>
      </section>
      
      {/* Featured Products */}
      <ProductGrid 
        title="Featured Products" 
        products={featuredProducts}
        showFilters={true}
        isLoading={isProductsLoading}
      />
      
      {/* Promo Banner */}
      <section className="relative bg-primary my-12">
        <div className="container-custom py-12 md:py-16">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-white mb-4">Summer Sale</h2>
              <p className="text-xl text-white/90 mb-6">Get up to 40% off on selected items.</p>
              <Button 
                asChild
                className="bg-white text-primary hover:bg-neutral-100 transition-colors"
              >
                <Link href="/products?sale=true">Shop the Sale</Link>
              </Button>
            </div>
            <div className="md:w-1/2 md:flex md:justify-end">
              <img 
                src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6" 
                alt="Summer sale promotional image" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Best Sellers */}
      <ProductGrid 
        title="Best Sellers" 
        products={bestSellers}
        isLoading={isProductsLoading}
      />
      
      <Features />
      <Newsletter />
    </>
  );
};

export default Home;
