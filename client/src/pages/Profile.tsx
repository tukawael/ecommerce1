import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, ShoppingBag, CreditCard, Settings, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

const Profile = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout, checkAuth } = useAuth();
  const { toast } = useToast();
  
  // Check authentication status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Authentication check failed:", error);
          navigate("/");
        }
      }
    };
    
    verifyAuth();
  }, [isAuthenticated, checkAuth, navigate]);
  
  // If still not authenticated after check, show loading or redirect
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);
  
  // If no user data, show loading
  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading profile...</h2>
        <p>Please wait while we load your profile information.</p>
      </div>
    );
  }
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName || "",
      email: user.email || "",
      address: user.address || "",
    },
  });
  
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onProfileSubmit = (data: ProfileFormValues) => {
    // In a real application, we would update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const onSecuritySubmit = (data: SecurityFormValues) => {
    // In a real application, we would update the password
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    securityForm.reset();
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <>
      <Helmet>
        <title>My Profile | ShopEase</title>
        <meta name="description" content="Manage your account settings, view order history, and update your profile information." />
        <meta property="og:title" content="My Profile | ShopEase" />
        <meta property="og:description" content="Manage your account settings, view order history, and update your profile information." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-primary/5 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-neutral-800">My Account</h1>
          <p className="text-neutral-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {user.username}
                </CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 p-0">
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start pl-6" asChild>
                  <a href="/orders">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Orders
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Methods
                </Button>
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </CardContent>
              <CardFooter className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Log out
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button type="submit">Update Password</Button>
                        </div>
                      </form>
                    </Form>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Account Security
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-neutral-500">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Button variant="outline">Enable</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Login History</p>
                            <p className="text-sm text-neutral-500">
                              View your recent login activity
                            </p>
                          </div>
                          <Button variant="outline">View</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
