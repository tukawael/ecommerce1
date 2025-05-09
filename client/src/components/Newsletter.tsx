import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate subscription
    setTimeout(() => {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll now receive our latest updates and offers.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="bg-white py-12">
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Stay Updated</h2>
        <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter and be the first to know about new products, special offers, and exclusive deals.
        </p>
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white font-medium transition duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
