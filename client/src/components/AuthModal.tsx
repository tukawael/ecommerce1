import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthModal = () => {
  // Default values for auth context
  let isAuthModalOpen = false;
  let closeAuthModal = () => {};
  let login = (_username: string, _password: string) => Promise.resolve();
  let registerUser = (_data: RegisterFormValues) => Promise.resolve();
  let isLoading = false;
  let error: string | null = null;
  
  try {
    const auth = useAuth();
    isAuthModalOpen = auth.isAuthModalOpen;
    closeAuthModal = auth.closeAuthModal;
    login = auth.login;
    registerUser = auth.register;
    isLoading = auth.isLoading;
    error = auth.error;
  } catch (e) {
    console.log('Auth context not available in AuthModal');
  }
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isAuthModalOpen) {
      // Reset forms when modal is closed
      loginForm.reset();
      registerForm.reset();
      setIsLogin(true);
    }
  }, [isAuthModalOpen, loginForm, registerForm]);

  const onLoginSubmit = (data: LoginFormValues) => {
    login(data.username, data.password);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerUser(data);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset error when switching forms
  };

  if (!isAuthModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeAuthModal}
      ></div>
      
      <div className="fixed inset-0 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">{isLogin ? "Sign In" : "Create Account"}</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={closeAuthModal}
              className="text-neutral-500 hover:text-neutral-800"
              type="button"
            >
              <X />
            </Button>
          </div>
          
          {/* Login Form */}
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="p-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel>Password</FormLabel>
                        <a href="#" className="text-sm text-primary hover:text-primary/80">
                          Forgot Password?
                        </a>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && <p className="text-destructive text-sm mb-4">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-neutral-600">Don't have an account?</span>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={toggleForm}
                    type="button"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            /* Register Form */
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="p-6">
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="w-full px-3 py-2 border rounded-md"
                    {...registerForm.register("username")}
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border rounded-md"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="w-full px-3 py-2 border rounded-md"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 border rounded-md"
                    {...registerForm.register("confirmPassword")}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                {error && <p className="text-destructive text-sm mb-4">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-neutral-600">Already have an account?</span>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={toggleForm}
                    type="button"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
