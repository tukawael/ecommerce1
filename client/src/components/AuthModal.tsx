import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type LoginFormValues = {
  username: string;
  email: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register: registerUser,
    isLoading,
    error,
  } = useAuth();
  
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // States for form values
  const [loginFormValues, setLoginFormValues] = useState<LoginFormValues>({
    username: "",
    email: "",
    password: "",
  });

  const [registerFormValues, setRegisterFormValues] = useState<RegisterFormValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isAuthModalOpen) {
      setLoginFormValues({
        username: "",
        email: "",
        password: "",
      });
      setRegisterFormValues({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setIsLogin(true);
      setFormError(null);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    setFormError(error);
  }, [error]);

  // Validate login form
  const validateLogin = (data: LoginFormValues) => {
    if (!data.username || !data.email || !data.password) {
      return "All fields are required";
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  // Validate registration form
  const validateRegister = (data: RegisterFormValues) => {
    if (!data.username || !data.email || !data.password || !data.confirmPassword) {
      return "All fields are required";
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      return "Please enter a valid email address";
    }
    if (data.password !== data.confirmPassword) {
      return "Passwords do not match";
    }
    if (data.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  // Handle form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    const error = validateLogin(data);
    if (error) {
      setFormError(error);
      return;
    }
    try {
      await login(data);
    } catch (error) {
      console.error("Login error:", error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected login error"
      );
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setFormError(null);
    const error = validateRegister(data);
    if (error) {
      setFormError(error);
      return;
    }
    try {
      const successMessage = await registerUser(data);
      
      // Show success toast
      toast({
        title: "Registration Successful",
        description: successMessage,
        duration: 5000,
      });
      
      // Switch to login form
      setIsLogin(true);
    } catch (error) {
      console.error("Register error:", error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected registration error"
      );
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormError(null);
  };

  // Handle input change for login and registration forms
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormValues({
      ...loginFormValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterFormValues({
      ...registerFormValues,
      [e.target.name]: e.target.value,
    });
  };

  if (!isAuthModalOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeAuthModal}
      />
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
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

          {isLogin ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onLoginSubmit(loginFormValues);
              }}
              className="p-6"
            >
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={loginFormValues.username}
                  onChange={handleLoginInputChange}
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={loginFormValues.email}
                  onChange={handleLoginInputChange}
                  placeholder="Enter email"
                  autoComplete="off"
                />
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Forgot Password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={loginFormValues.password}
                  onChange={handleLoginInputChange}
                  placeholder="Enter password"
                />
              </div>

              {formError && (
                <p className="text-destructive text-sm mb-4">{formError}</p>
              )}

<Button type="submit" className="w-full mb-4" disabled={isLoading}>
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
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onRegisterSubmit(registerFormValues);
              }}
              className="p-6"
            >
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={registerFormValues.username}
                  onChange={handleRegisterInputChange}
                  placeholder="Choose a username"
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registerFormValues.email}
                  onChange={handleRegisterInputChange}
                  placeholder="Enter email"
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={registerFormValues.password}
                  onChange={handleRegisterInputChange}
                  placeholder="Enter password"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={registerFormValues.confirmPassword}
                  onChange={handleRegisterInputChange}
                  placeholder="Confirm password"
                />
              </div>

              {formError && (
                <p className="text-destructive text-sm mb-4">{formError}</p>
              )}

              <Button type="submit" className="w-full mb-4" disabled={isLoading}>
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
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
