import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductGrid from "@/components/ProductGrid";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';
import { Filter, Sliders } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Products = () => {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  
  // Get the category slug from URL params
  const categorySlug = queryParams.get("category");
  const saleFilter = queryParams.get("sale");
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categorySlug ? [categorySlug] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showOnSale, setShowOnSale] = useState<boolean>(
    saleFilter === "true"
  );
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  
  // Fetch categories
  const { 
    data: categories,
    isLoading: isCategoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch products
  const { 
    data: allProducts,
    isLoading: isProductsLoading 
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Filter products based on selected filters
  const filteredProducts = allProducts ? allProducts.filter(product => {
    // Filter by categories
    if (selectedCategories.length > 0) {
      const categoryMatch = selectedCategories.some(slug => {
        const category = categories?.find(c => c.slug === slug);
        return product.categoryId === category?.id;
      });
      if (!categoryMatch) return false;
    }
    
    // Filter by price
    const price = product.isOnSale && product.salePrice 
      ? product.salePrice 
      : product.price;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    
    // Filter by sale items
    if (showOnSale && !product.isOnSale) return false;
    
    // Filter by new arrivals
    if (showNewArrivals && !product.isNew) return false;
    
    return true;
  }) : [];
  
  // Handle category checkbox change
  const handleCategoryChange = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug)
        ? prev.filter(cat => cat !== slug)
        : [...prev, slug]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setShowOnSale(false);
    setShowNewArrivals(false);
  };

  return (
    <>
      <Helmet>
        <title>Shop All Products | ShopEase</title>
        <meta name="description" content="Browse our collection of high-quality products. Find electronics, fashion, home goods and more with great deals and fast shipping." />
        <meta property="og:title" content="Shop All Products | ShopEase" />
        <meta property="og:description" content="Browse our collection of high-quality products with free shipping on orders over $50." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-primary/5 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-neutral-800">
            {categorySlug 
              ? `${categories?.find(c => c.slug === categorySlug)?.name || 'Category'} Products`
              : showOnSale
                ? 'Sale Items'
                : 'All Products'
            }
          </h1>
          <p className="text-neutral-600 mt-2">
            {filteredProducts.length} products available
          </p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filters Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {isCategoriesLoading ? (
                      <p>Loading categories...</p>
                    ) : (
                      categories?.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-cat-${category.slug}`} 
                            checked={selectedCategories.includes(category.slug)}
                            onCheckedChange={() => handleCategoryChange(category.slug)}
                          />
                          <Label htmlFor={`mobile-cat-${category.slug}`}>{category.name}</Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Sale and New Filters */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Product Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mobile-sale" 
                        checked={showOnSale}
                        onCheckedChange={(checked) => setShowOnSale(checked === true)}
                      />
                      <Label htmlFor="mobile-sale">On Sale</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mobile-new" 
                        checked={showNewArrivals}
                        onCheckedChange={(checked) => setShowNewArrivals(checked === true)} 
                      />
                      <Label htmlFor="mobile-new">New Arrivals</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-8">
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1">Apply</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="h-auto p-0 text-primary"
                >
                  Reset
                </Button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {isCategoriesLoading ? (
                    <p>Loading categories...</p>
                  ) : (
                    categories?.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${category.slug}`} 
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={() => handleCategoryChange(category.slug)}
                        />
                        <Label htmlFor={`cat-${category.slug}`}>{category.name}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Sale and New Filters */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Product Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sale" 
                      checked={showOnSale}
                      onCheckedChange={(checked) => setShowOnSale(checked === true)}
                    />
                    <Label htmlFor="sale">On Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new" 
                      checked={showNewArrivals}
                      onCheckedChange={(checked) => setShowNewArrivals(checked === true)} 
                    />
                    <Label htmlFor="new">New Arrivals</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid 
              title="" 
              products={filteredProducts}
              showFilters={true}
              isLoading={isProductsLoading || isCategoriesLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
