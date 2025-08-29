import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { SignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminLoginForm from "@/components/Auth/AdminLoginForm";

const LoginPage: React.FC = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin()) {
        navigate("/admin");
      } else if (isStudent()) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, isStudent, navigate]);

  const handleAdminSuccess = () => {
    window.location.reload();
  };

  if (showAdminLogin) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <AdminLoginForm
              onSuccess={handleAdminSuccess}
              onCancel={() => setShowAdminLogin(false)}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-white to-purple-100/60 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-10">
          {/* Logo + Welcome */}
          <div className="text-center space-y-3">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MocKinvi
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Interview Practice Platform
            </p>
            <h2 className="text-3xl font-semibold text-gray-800 mt-6">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base">
              Sign in to your account to continue
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="rounded-3xl shadow-2xl border border-white/30 bg-white/40 backdrop-blur-xl">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Sign In to MocKinvi
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Welcome back! Please sign in to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-10">
              {/* Clerk Sign In */}
              <SignIn
                signUpUrl="/register"
                afterSignInUrl="/dashboard"
                appearance={{
                  elements: {
                    // Remove Clerk’s default card
                    card: "shadow-none border-none bg-transparent p-0 w-full",
                    rootBox: "w-full flex flex-col items-center space-y-6",

                    // Hide internal headers
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",

                    // Social Buttons
                    socialButtonsBlockButton:
                      "w-full bg-white/80 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm font-medium transition hover:shadow-sm backdrop-blur",
                    socialButtonsBlockButtonText:
                      "text-gray-700 text-sm font-medium",

                    // Hide Clerk's divider (we use our own)
                    dividerLine: "hidden",
                    dividerText: "hidden",

                    // Inputs
                    formField: "mb-4 w-full",
                    formFieldLabel:
                      "text-gray-700 text-sm font-medium mb-1 tracking-wide",
                    formFieldInput:
                      "w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl text-gray-700 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",

                    // Primary Button
                    formButtonPrimary:
                      "w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-xl transition hover:shadow-lg",

                    // Hide footer
                    footer: "hidden",
                    footerAction: "hidden",
                    footerActionLink: "hidden",
                  },
                }}
              />

              {/* Custom Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 backdrop-blur rounded-full text-gray-500 font-medium">
                    Or
                  </span>
                </div>
              </div>

              {/* Admin Access */}
              <Button
                variant="outline"
                onClick={() => setShowAdminLogin(true)}
                className="w-full bg-white/80 hover:bg-white text-gray-700 font-medium py-3 rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-lg hover:border-gray-400 backdrop-blur"
              >
                Admin Access
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </a>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Secured by Clerk</span>
              <span>•</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                Development Mode
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
