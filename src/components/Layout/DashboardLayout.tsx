
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  FileText, 
  Award, 
  Settings, 
  LogOut,
  FileVideo,
  Tag,
  CreditCard,
  Sparkles,
  GraduationCap,
  UserCog,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  icon: any;
  label: string;
  href: string;
  color: string; // tailwind color class for icon
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const studentNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: 'text-cyrobox-primary' },
    { icon: Video, label: 'Interview Practice', href: '/interviews', color: 'text-cyrobox-primary' },
    { icon: Sparkles, label: 'Custom Interviews', href: '/custom-interviews', color: 'text-cyrobox-primary' },
    { icon: FileText, label: 'AI Resume Maker', href: '/resume-maker', color: 'text-cyrobox-primary' },
    { icon: BookOpen, label: 'Learning Hub', href: '/learning', color: 'text-cyrobox-primary' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs', color: 'text-cyrobox-primary' },
    { icon: FileText, label: 'Interview Resources', href: '/interview-resources', color: 'text-cyrobox-primary' },
    { icon: Award, label: 'Certificates', href: '/certificates', color: 'text-cyrobox-primary' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-cyrobox-primary' },
  ];

  const adminNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', color: 'text-cyrobox-primary' },
    { icon: UserCog, label: 'User Management', href: '/admin/user-management', color: 'text-cyrobox-primary' },
    { icon: GraduationCap, label: 'Course Management', href: '/admin/courses', color: 'text-cyrobox-primary' },
    { icon: FileText, label: 'Interview Resources', href: '/admin/interview-resources', color: 'text-cyrobox-primary' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments', color: 'text-cyrobox-primary' },
    { icon: Award, label: 'Certificates', href: '/admin/certificates', color: 'text-cyrobox-primary' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', color: 'text-cyrobox-primary' },
  ];

  const navItems = (isAdmin() ? adminNavItems : studentNavItems);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-10 sidebar-glass">
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-8 h-8 bg-cyrobox-primary rounded-lg flex items-center justify-center shadow">
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
            <span className="text-xl font-bold text-foreground">MocKinvi</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
        
        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <div className="mb-8">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Main
            </div>
            <nav className="space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200',
                    location.pathname === item.href
                      ? 'bg-cyrobox-primary/10 text-cyrobox-primary shadow-sm border border-cyrobox-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-cyrobox-primary'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 mr-3 flex-shrink-0', item.color)} />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto border-t border-border pt-4">
            <div className="px-4 py-3 mb-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-cyrobox-primary flex items-center justify-center text-white font-medium shadow-lg">
                    {(profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U')}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.primaryEmailAddress?.emailAddress || 'guest@mockinvi.ai'}
                  </p>
                </div>
              </div>
            </div>
            {user && (
              <Button
                variant="ghost"
                className="flex items-center w-full px-4 py-3 text-sm text-muted-foreground rounded-xl hover:bg-muted hover:text-cyrobox-primary transition-all duration-200"
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                  } catch (e) {}
                }}
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-64 overflow-y-auto bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 nav-glass md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyrobox-primary rounded flex items-center justify-center">
              <div className="relative w-4 h-4">
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
            <span className="text-xl font-bold text-foreground">MocKinvi</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </header>
        
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
