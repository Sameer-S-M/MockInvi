import { supabase } from '@/integrations/supabase/client';

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export const subscriptionService = {
  async cancelSubscription(userId: string): Promise<CancelSubscriptionResponse> {
    try {
      console.log('Canceling subscription for user:', userId);
      
      // Update the subscription status to 'cancelled' instead of deleting
      // This preserves the subscription history and allows for reactivation
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error canceling subscription:', error);
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }

      console.log('Subscription cancelled successfully');
      return {
        success: true,
        message: 'Your subscription has been cancelled successfully. You will continue to have access until the end of your current billing period.'
      };
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      throw error;
    }
  },

  async reactivateSubscription(userId: string): Promise<CancelSubscriptionResponse> {
    try {
      console.log('Reactivating subscription for user:', userId);
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'cancelled');

      if (error) {
        console.error('Error reactivating subscription:', error);
        throw new Error(`Failed to reactivate subscription: ${error.message}`);
      }

      console.log('Subscription reactivated successfully');
      return {
        success: true,
        message: 'Your subscription has been reactivated successfully.'
      };
    } catch (error) {
      console.error('Error in reactivateSubscription:', error);
      throw error;
    }
  }
};
