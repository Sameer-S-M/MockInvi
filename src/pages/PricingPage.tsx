import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import PricingSection from '@/components/Home/PricingSection';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const PricingPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged again. You can easily manage your subscription from your dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, and net banking through our secure payment partner Razorpay. All payments are encrypted and secure, ensuring your financial information is protected."
    },
    {
      question: "Is there a free trial available?",
      answer: "Our Basic plan is completely free and includes essential features to get you started. You can upgrade to Pro anytime to unlock advanced capabilities. No credit card required for the free plan."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! We offer special pricing for students. Please contact our support team with your student ID for exclusive student discounts and educational pricing options."
    },
    {
      question: "Can I switch between plans?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate will apply at your next billing cycle."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you reach your plan limits, you'll receive a notification. You can either upgrade to Pro for unlimited access or wait until your next billing cycle when your limits reset."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyrobox-primary rounded-3xl mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your <span className="text-cyrobox-primary">Plan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Select the perfect plan for your interview preparation needs. 
              Start free and upgrade when you're ready for more advanced features.
            </p>
          </div>
        </div>
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* FAQ Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Everything you need to know about our pricing and plans
                </p>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-cyrobox-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFAQ === index && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Contact Support */}
              <div className="mt-16 text-center">
                <div className="bg-cyrobox-primary/5 dark:bg-cyrobox-primary/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Still Have Questions?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Can't find the answer you're looking for? Our support team is here to help 
                    you get the most out of MocKinvi.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="/contact" 
                      className="inline-flex items-center justify-center px-6 py-3 bg-cyrobox-primary hover:bg-cyrobox-primary-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Contact Support
                    </a>
                    <a 
                      href="mailto:contact@cyrobox.in" 
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary text-gray-700 dark:text-gray-300 hover:text-cyrobox-primary dark:hover:text-cyrobox-primary font-semibold rounded-lg transition-all duration-200"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;