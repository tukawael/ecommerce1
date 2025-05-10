import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, MailIcon, UserIcon } from 'lucide-react';

interface UserProfile {
  username: string;
  fullName?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  address?: string;
  createdAt?: string | Date;
  isVerified?: boolean;
}

const Profile: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    logout,
    showAuthModal
  } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      document.title = `${currentUser.username}'s Profile | E-commerce Platform`;
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Helmet>
          <title>Login Required | E-commerce Platform</title>
        </Helmet>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login Required</CardTitle>
            <CardDescription>
              Please log in to view your profile information
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={showAuthModal} size="lg">
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getInitials = (user: UserProfile): string => {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const formatJoinDate = (createdAt?: string | Date): string => {
    if (!createdAt) return "Unknown";
    const date = new Date(createdAt);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (!currentUser) {
    return null; // or some error state
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{currentUser.username} | E-commerce Platform</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <CardContent className="pt-0 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src='https://static.vecteezy.com/system/resources/previews/051/270/245/non_2x/cartoon-people-avatar-minimalist-human-avatar-versatile-icon-for-online-projects-an-avatar-for-the-profile-picture-of-someone-vector.jpg'
                  alt={currentUser.username} 
                />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left mt-4 md:mt-16">
                <h1 className="text-3xl font-bold">
                  { currentUser.username}
                </h1>
              
             
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {currentUser.username || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {currentUser.email || 'Not provided'}
                  </p>
                </div>
              </div>
            
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  logout();
                  toast({
                    title: "Logged out successfully",
                    description: "You have been logged out of your account",
                  });
                }}
              >
                Logout
              </Button>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;