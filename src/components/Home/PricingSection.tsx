
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckIcon, Star, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import RazorpayButton from '@/components/Payment/RazorpayButton';

const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActivePlan, hasAnyActivePlan } = useSubscription();
  const { settings: paymentSettings } = usePaymentSettings();
  
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started with interview preparation",
      icon: Star,
      features: [
        "5 AI-generated interview questions per week",
        "Basic resume analysis",
        "Limited access to Learning Hub content",
        "1 interview practice session per week",
        "Basic performance reports",
        "Community forum access"
      ],
      buttonText: "Get Started Free",
      popular: false,
      buttonVariant: "outline",
      planType: "basic",
      amount: 0,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Pro",
      price: paymentSettings ? `₹${paymentSettings.pro_plan_price_inr}` : "₹999",
      period: " per month",
      description: "Everything you need for interview success",
      icon: Crown,
      features: [
        "Unlimited AI-generated interview questions",
        "Advanced resume analysis with AI insights",
        "Full access to Learning Hub content",
        "Unlimited interview practice sessions",
        "Detailed performance reports with analytics",
        "Facial expression analysis",
        "Interview recording & playback",
        "Priority customer support",
        "Custom interview scenarios",
        "Progress tracking & analytics"
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
      buttonVariant: "default",
      planType: "pro",
      amount: paymentSettings?.pro_plan_price_inr || 999,
      color: "from-cyrobox-primary to-cyrobox-primary-dark"
    }
  ];

  const renderButton = (plan: any) => {
    if (!user) {
      return (
        <Button
          variant={plan.buttonVariant as "default" | "outline"}
          className={`w-full h-12 text-base font-semibold ${
            plan.popular 
              ? 'bg-cyrobox-primary hover:bg-cyrobox-primary-dark text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200' 
              : 'border-2 border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary text-gray-700 dark:text-gray-300 hover:text-cyrobox-primary dark:hover:text-cyrobox-primary'
          }`}
          onClick={() => navigate('/register')}
        >
          {plan.buttonText}
        </Button>
      );
    }

    if (plan.planType === 'basic') {
      return (
        <Button
          variant={plan.buttonVariant as "default" | "outline"}
          className="w-full h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary text-gray-700 dark:text-gray-300 hover:text-cyrobox-primary dark:hover:text-cyrobox-primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      );
    }

    if (hasActivePlan(plan.planType)) {
      return (
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-2 border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 cursor-not-allowed"
          disabled
        >
          Current Plan
        </Button>
      );
    }

    return (
      <RazorpayButton
        amount={plan.amount}
        planType={plan.planType}
        planName={plan.name}
        buttonText={plan.buttonText}
        variant={plan.buttonVariant as "default" | "outline"}
      />
    );
  };

  return (
    <section id="pricing" className="py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyrobox-primary rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your interview preparation journey. 
            Start free and upgrade when you're ready for more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-cyrobox-primary dark:border-cyrobox-primary bg-cyrobox-primary/5 dark:bg-cyrobox-primary/10 shadow-2xl scale-105 z-10' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 text-sm font-bold text-white bg-cyrobox-primary rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-lg font-medium text-gray-500 dark:text-gray-400">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">{plan.description}</p>
                </div>
                
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 p-1 text-cyrobox-primary">
                        <CheckIcon className="w-5 h-5" />
                      </div>
                      <p className="ml-3 text-gray-700 dark:text-gray-300 text-base">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                {renderButton(plan)}
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-cyrobox-primary/5 dark:bg-cyrobox-primary/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need a Custom Plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We offer enterprise solutions and custom pricing for organizations, 
              educational institutions, and teams.
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-cyrobox-primary hover:bg-cyrobox-primary-dark text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Contact Sales Team
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
