
import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Settings, CreditCard, Gift, Award } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Check for temporary admin access
  const isTempAdmin = localStorage.getItem('tempAdmin') === 'true';
  
  if (!user && !isTempAdmin) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin() && !isTempAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const adminCards = [
    {
      title: "Course Management",
      description: "Create and manage educational courses and video content",
      icon: BookOpen,
      href: "/admin/courses",
      color: "bg-cyrobox-primary"
    },
    {
      title: "Content Management",
      description: "Manage learning materials and resources",
      icon: FileText,
      href: "/admin/courses",
      color: "bg-cyrobox-primary-dark"
    },
    {
      title: "Payment Management",
      description: "View and manage payment transactions",
      icon: CreditCard,
      href: "/admin/payments",
      color: "bg-cyrobox-primary"
    },
    {
      title: "Certificate Management",
      description: "Manage course certificates and achievements",
      icon: Award,
      href: "/admin/certificates",
      color: "bg-cyrobox-primary-dark"
    },
    {
      title: "Settings",
      description: "Configure system settings and preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-cyrobox-primary"
    }
  ];

  const stats = useAdminStats();
  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your educational platform from here
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-border hover:border-cyrobox-primary/30">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`${card.color} p-2 rounded-lg mr-3`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-muted-foreground">
                  {card.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full border-border hover:border-cyrobox-primary hover:text-cyrobox-primary hover:bg-cyrobox-primary/5"
                  onClick={() => window.location.href = card.href}
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Stats</CardTitle>
              <CardDescription className="text-muted-foreground">Overview of your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-cyrobox-primary/10 rounded-lg border border-cyrobox-primary/20">
                  <h3 className="text-2xl font-bold text-cyrobox-primary">{stats.loading ? '…' : stats.totalCourses}</h3>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <div className="text-center p-4 bg-cyrobox-primary/10 rounded-lg border border-cyrobox-primary/20">
                  <h3 className="text-2xl font-bold text-cyrobox-primary">{stats.loading ? '…' : stats.activeStudents}</h3>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
                <div className="text-center p-4 bg-cyrobox-primary/10 rounded-lg border border-cyrobox-primary/20">
                  <h3 className="text-2xl font-bold text-cyrobox-primary">{stats.loading ? '…' : inr.format(stats.totalRevenue)}</h3>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-cyrobox-primary/10 rounded-lg border border-cyrobox-primary/20">
                  <h3 className="text-2xl font-bold text-cyrobox-primary">{stats.loading ? '…' : stats.certificatesIssued}</h3>
                  <p className="text-sm text-muted-foreground">Certificates Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
