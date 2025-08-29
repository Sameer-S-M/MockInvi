
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  BarChart3,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from 'next-themes';

interface DashboardAnalyticsProps {
  interviewCount: number;
  currentStreak: number;
  averageScore: number;
  performanceHistory: Array<{ name: string; score: number }>;
  interviewTypeBreakdown: Array<{ name: string; value: number; color: string }>;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  interviewCount,
  currentStreak,
  averageScore,
  performanceHistory,
  interviewTypeBreakdown
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const axisStroke = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const tooltipStyle = isDark
    ? {
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        color: 'rgba(255,255,255,0.95)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        color: 'rgba(0,0,0,0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      } as React.CSSProperties;

  // Show empty state if no data
  if (interviewCount === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-white/10">
            <Target className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-100">No Interview Data Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Complete your first interview to see your analytics here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card floating-card group border border-gray-200 dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Interview Sessions</CardTitle>
            <div className="p-2 glass-morphism rounded-lg group-hover:scale-110 transition-transform">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {interviewCount}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {interviewCount > 0 ? 'Great progress!' : 'Start your first interview'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card floating-card group border border-gray-200 dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Current Streak</CardTitle>
            <div className="p-2 glass-morphism rounded-lg group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {currentStreak > 0 ? 'Keep it up! 🔥' : 'Start building your streak'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card floating-card group border border-gray-200 dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Average Score</CardTitle>
            <div className="p-2 glass-morphism rounded-lg group-hover:scale-110 transition-transform">
              <Star className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {averageScore}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {averageScore > 0 && (
                <Badge variant="outline" className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-white/10 text-xs">
                  {averageScore >= 80 ? 'Excellent!' : averageScore >= 60 ? 'Good progress' : 'Keep improving'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border border-gray-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <div className="p-2 glass-morphism rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              Performance Trend
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Your interview scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke={axisStroke} />
                  <YAxis stroke={axisStroke} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#60A5FA"
                    strokeWidth={3}
                    dot={{ fill: '#60A5FA', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#60A5FA', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No performance data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border border-gray-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <div className="p-2 glass-morphism rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              Interview Types
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Number of times each interview type was taken</CardDescription>
          </CardHeader>
          <CardContent>
            {interviewTypeBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={interviewTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {interviewTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-3 mt-6">
                  {interviewTypeBreakdown.map((type, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 glass-morphism rounded-xl border border-gray-200 dark:border-white/10">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: type.color }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{type.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{type.value} time{type.value !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No interview type data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
