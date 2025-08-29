
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBillingData } from '@/hooks/useBillingData';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { subscriptionService } from '@/services/subscriptionService';
import { format } from 'date-fns';
import { Loader2, AlertTriangle } from 'lucide-react';

const BillingSection: React.FC = () => {
  const { billingHistory, currentPlan, planRenewalDate, loading, error } = useBillingData();
  const { hasProPlan } = useSubscription();
  const { getSupabaseUserId } = useAuth();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    const value = amount / 100; // Convert from paise to rupees
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleCancelSubscription = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period, but you will not be charged again.'
    );
    
    if (!confirmed) {
      return;
    }

    const userId = getSupabaseUserId();
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found. Please try logging out and back in.',
        variant: 'destructive',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const result = await subscriptionService.cancelSubscription(userId);
      
      toast({
        title: 'Subscription Cancelled',
        description: result.message,
      });

      // Refresh the page to update subscription status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>Loading billing information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>Unable to load billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>
          Manage your subscription plan and payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gray-50 rounded-lg border mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Current Plan</span>
            <span className="text-brand-purple font-medium">
              {currentPlan ? currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) : 'Free'}
            </span>
          </div>
          {planRenewalDate && (
            <p className="text-sm text-gray-600 mb-2">
              Your plan renews on {formatDate(planRenewalDate)}
            </p>
          )}
          {hasProPlan() && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          )}
        </div>
        
        {billingHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-4">Billing History</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50 p-3 font-medium">
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Plan</div>
              </div>
              {billingHistory.map((payment) => (
                <div key={payment.id} className="grid grid-cols-4 p-3 border-t">
                  <div>{formatDate(payment.created_at)}</div>
                  <div>{formatCurrency(payment.amount, payment.currency)}</div>
                  <div>
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                  <div className="capitalize">{payment.plan_type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {billingHistory.length === 0 && !currentPlan && (
          <div className="text-center py-6">
            <p className="text-gray-500">No billing history available</p>
            <p className="text-sm text-gray-400 mt-1">Subscribe to a plan to see your billing history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingSection;
