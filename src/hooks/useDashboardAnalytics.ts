import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { localStorageService, UserStats } from '@/utils/localStorageService';

interface DashboardAnalytics {
  interviewCount: number;
  currentStreak: number;
  averageScore: number;
  lastInterviewDate: string | null;
  performanceHistory: Array<{ name: string; score: number }>;
  interviewTypeBreakdown: Array<{ name: string; value: number; color: string }>;
  loading: boolean;
}

export const useDashboardAnalytics = (): DashboardAnalytics => {
  const { isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    interviewCount: 0,
    currentStreak: 0,
    averageScore: 0,
    lastInterviewDate: null,
    performanceHistory: [],
    interviewTypeBreakdown: [],
    loading: true
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isAuthenticated) {
        setAnalytics(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Get data from local storage
        const userStats = localStorageService.getUserStats();
        const performanceHistory = localStorageService.getPerformanceTrend();
        const interviewTypeBreakdown = localStorageService.getInterviewTypeBreakdown();
        const averageScore = localStorageService.getAverageScore();

        setAnalytics({
          interviewCount: userStats.interviewCount,
          currentStreak: userStats.currentStreak,
          averageScore,
          lastInterviewDate: userStats.lastInterviewDate,
          performanceHistory,
          interviewTypeBreakdown,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, [isAuthenticated]);

  return analytics;
};