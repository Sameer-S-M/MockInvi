
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardAnalytics from '@/components/Dashboard/DashboardAnalytics';
import {
  Play,
  BookOpen,
  TrendingUp,
  Zap,
  Clock,
  BarChart3,
  Star,
  Target,
  Database
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useInterviewUsage } from '@/hooks/useInterviewUsage';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
// Sample data utilities removed per request

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasProPlan, subscription } = useSubscription();
  const { canUseFreeInterview, usage } = useInterviewUsage();
  const analytics = useDashboardAnalytics();

  const isPro = hasProPlan();
  const daysLeft = (() => {
    try {
      if (!subscription || !subscription.current_period_end) return null;
      const end = new Date(subscription.current_period_end).getTime();
      const now = Date.now();
      const ms = end - now;
      const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
      return d > 0 ? d : 0;
    } catch {
      return null;
    }
  })();
  const canStartInterview = isPro || canUseFreeInterview();

  // Removed populate/clear sample data controls

  const scrollToProgress = () => {
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
      progressSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Welcome back!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
              Ready to ace your next interview? Let's practice together.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Badge variant="outline" className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-white/10">
                {canUseFreeInterview() ? '1 Free Interview Available' : 'Free Trial Used'}
              </Badge>
            )}
            {isPro && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/30">
                <Zap className="w-3 h-3 mr-1" />
                PRO Member{typeof daysLeft === 'number' ? ` • ${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Sample Data Controls removed */}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card floating-card cursor-pointer group border border-gray-200 dark:border-white/10" onClick={() => navigate('/interviews')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                {canStartInterview && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-400">
                    Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors text-gray-700 dark:text-gray-200">Start Interview</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {canStartInterview
                  ? "Practice with AI-powered mock interviews"
                  : "Upgrade to Pro for unlimited interviews"
                }
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card floating-card cursor-pointer group border border-gray-200 dark:border-white/10" onClick={() => navigate('/learning')}>
            <CardHeader className="pb-3">
              <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2 group-hover:text-green-600 transition-colors text-gray-700 dark:text-gray-200">Learning Hub</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Access courses and improve your skills
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card floating-card cursor-pointer group border border-gray-200 dark:border-white/10" onClick={scrollToProgress}>
            <CardHeader className="pb-3">
              <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2 group-hover:text-purple-600 transition-colors text-gray-700 dark:text-gray-200">Progress Reports</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Track your interview performance and growth
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div id="progress-section">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 glass-morphism rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Your Progress</h2>
          </div>
          <DashboardAnalytics
            interviewCount={analytics.interviewCount}
            currentStreak={analytics.currentStreak}
            averageScore={analytics.averageScore}
            performanceHistory={analytics.performanceHistory}
            interviewTypeBreakdown={analytics.interviewTypeBreakdown}
          />
        </div>

        {/* Recent Activity & Quick Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card border border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <div className="p-2 glass-morphism rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.lastInterviewDate ? (
                  <div className="flex items-center justify-between p-4 glass-morphism rounded-xl border border-gray-200 dark:border-white/10">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">Last Interview Session</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(analytics.lastInterviewDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-400">Completed</Badge>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="p-4 glass-morphism rounded-2xl w-fit mx-auto mb-4 border border-gray-200 dark:border-white/10">
                      <Play className="h-8 w-8 opacity-50" />
                    </div>
                    <p>No interviews completed yet</p>
                    <p className="text-sm">Start your first practice session!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <div className="p-2 glass-morphism rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 glass-morphism rounded-xl border-l-4 border-blue-500 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <p className="font-medium text-blue-700 dark:text-blue-300">Practice regularly</p>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300/80">Consistent practice leads to better performance</p>
                </div>
                <div className="p-4 glass-morphism rounded-xl border-l-4 border-green-500 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-green-700 dark:text-green-300">Review feedback</p>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300/80">Learn from AI suggestions to improve faster</p>
                </div>
                <div className="p-4 glass-morphism rounded-xl border-l-4 border-purple-500 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <p className="font-medium text-purple-700 dark:text-purple-300">Stay confident</p>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-300/80">Confidence is key to interview success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
