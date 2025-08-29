import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/ClerkAuthContext';

const Hero: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-gradient-primary" />
      </div>
      
      <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#4A69B1] rounded-lg flex items-center justify-center">
                  <div className="relative w-5 h-5">
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
                <span className="text-sm font-medium text-[#4A69B1] bg-[#4A69B1]/10 px-3 py-1 rounded-full">
                  Powered by CYROBOX
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                <span className="block">Ace Your Next</span>
                <span className="block text-[#4A69B1]">Interview</span>
                <span className="block">With MocKinvi</span>
              </h1>
            </div>
            
            <p className="max-w-lg text-xl text-gray-600">
              The ultimate AI-powered interview preparation platform by CYROBOX. Practice with mock interviews, 
              get intelligent feedback, and discover your next job opportunity with our smart crawling technology.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-[#4A69B1] hover:bg-[#3A5991] text-lg px-8 py-3"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/about')}
                    className="border-[#4A69B1] text-[#4A69B1] hover:bg-[#4A69B1] hover:text-white text-lg px-8 py-3"
                  >
                    Learn More
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg"
                  onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')}
                  className="bg-[#4A69B1] hover:bg-[#3A5991] text-lg px-8 py-3"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
          
          <div className="relative mt-10 lg:mt-0">
            <div className="relative overflow-hidden rounded-lg shadow-xl animate-fadeIn max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none mx-auto">
              <img
                src="/lovable-uploads/23109cc1-3f65-4c26-9142-d431fca949c9.png"
                alt="AI Interview Robot"
                className="object-contain w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              {/* Removed text overlays from the image */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;