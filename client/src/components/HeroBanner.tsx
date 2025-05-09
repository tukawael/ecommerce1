import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroBanner = () => {
  return (
    <div className="relative bg-neutral-900">
      <div className="relative h-[500px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607083206968-13611e3d76db" 
            alt="Ecommerce banner with products" 
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 to-neutral-900/30"></div>
        </div>
        <div className="relative container-custom h-full flex items-center">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Summer Collection
            </h1>
            <p className="mt-3 text-xl text-neutral-200">
              Discover the latest trends and get up to 50% off new arrivals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                <Link href="/products" className="flex items-center gap-2">
                  Shop Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className=" border-white hover:bg-white/10 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
