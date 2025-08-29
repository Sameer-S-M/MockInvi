import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const { user, profile, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = async () => {
    try {
      console.log("Logout button clicked");
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container flex items-center justify-between h-20 px-4 mx-auto">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex items-center space-x-3">
            {/* CYROBOX Logo */}
            <div className="w-12 h-12 bg-cyrobox-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <div className="relative w-8 h-8">
                {/* Hexagonal shield icon */}
                <div className="absolute inset-0 w-8 h-8">
                  <svg viewBox="0 0 32 32" className="w-full h-full">
                    <path 
                      d="M16 2 L28 8 L28 20 L16 26 L4 20 L4 8 Z" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 12 L16 16 L24 12" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 16 L16 20 L24 16" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 20 L16 24 L24 20" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-cyrobox-primary group-hover:text-cyrobox-primary-dark transition-all duration-300">
                MocKinvi
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                Powered by CYROBOX
              </span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
            Home
          </Link>
          
          {!user && (
            <>
              <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                About
              </Link>
              <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Pricing
              </Link>
              <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Contact
              </Link>
            </>
          )}
          
          {user && isStudent() && (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Dashboard
              </Link>
              <Link to="/learning" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Learning Hub
              </Link>
              <Link to="/interviews" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                My Interviews
              </Link>
              <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Jobs
              </Link>
              <Link to="/interview-resources" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Interview Guides
              </Link>
            </>
          )}
          
          {user && isAdmin() && (
            <>
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Admin Panel
              </Link>
              <Link to="/admin/user-management" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Manage Users
              </Link>
              <Link to="/admin/courses" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors font-medium">
                Manage Content
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:inline border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary"
          >
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                Hello, {profile?.full_name || 'User'}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary hover:bg-gray-50 dark:hover:bg-gray-800">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-cyrobox-primary hover:bg-cyrobox-primary-dark">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;