import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=new" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  On Sale
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-neutral-400 hover:text-white transition-colors duration-150">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-150">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-150">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-150">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-150">
                <Linkedin size={20} />
              </a>
            </div>
            <p className="text-neutral-400 mb-2">Download our app</p>
            <div className="flex space-x-2">
              <a href="#" className="block">
                <div className="bg-black rounded px-3 py-2 flex items-center border border-neutral-700">
                  <div className="mr-2">
                    <svg viewBox="0 0 384 512" width="20" height="20" fill="white">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </div>
              </a>
              <a href="#" className="block">
                <div className="bg-black rounded px-3 py-2 flex items-center border border-neutral-700">
                  <div className="mr-2">
                    <svg viewBox="0 0 512 512" width="20" height="20" fill="white">
                      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">GET IT ON</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-700 text-neutral-400 text-sm">
          <div className="flex flex-col md:flex-row md:justify-between">
            <p>&copy; 2025 ShopEase. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors duration-150">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-150">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors duration-150">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
