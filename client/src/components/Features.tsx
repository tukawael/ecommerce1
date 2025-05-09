import { Truck, Shield, RefreshCw } from "lucide-react";

const Features = () => {
  return (
    <section className="bg-neutral-100 py-12">
      <div className="container-custom">
        <h2 className="text-2xl font-bold text-neutral-800 text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-primary text-3xl mb-4 flex justify-center">
              <Truck size={36} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-neutral-600">
              Free shipping on all orders over $50. Same-day delivery available for select areas.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-primary text-3xl mb-4 flex justify-center">
              <Shield size={36} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
            <p className="text-neutral-600">
              100% secure payment processing with multiple payment options available.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-primary text-3xl mb-4 flex justify-center">
              <RefreshCw size={36} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
            <p className="text-neutral-600">
              30-day easy return policy. No questions asked refunds for your peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
