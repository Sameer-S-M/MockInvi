export interface InterviewData {
  id: string;
  date: string;
  score: number;
  type: string;
  skills: {
    technical: number;
    communication: number;
    problemSolving: number;
    leadership: number;
  };
}

export interface UserStats {
  interviewCount: number;
  currentStreak: number;
  lastInterviewDate: string | null;
  performanceHistory: InterviewData[];
  skillsBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    leadership: number;
  };
}

class LocalStorageService {
  private readonly USER_STATS_KEY = 'mockinvi_user_stats';
  private readonly INTERVIEWS_KEY = 'mockinvi_interviews';

  // Get user stats from localStorage
  getUserStats(): UserStats {
    const stored = localStorage.getItem(this.USER_STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return default stats
    return {
      interviewCount: 0,
      currentStreak: 0,
      lastInterviewDate: null,
      performanceHistory: [],
      skillsBreakdown: {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        leadership: 0
      }
    };
  }

  // Save user stats to localStorage
  saveUserStats(stats: UserStats): void {
    localStorage.setItem(this.USER_STATS_KEY, JSON.stringify(stats));
  }

  // Add a new interview result
  addInterviewResult(interviewData: InterviewData): void {
    const stats = this.getUserStats();
    
    // Add to performance history
    stats.performanceHistory.push(interviewData);
    
    // Update interview count
    stats.interviewCount = stats.performanceHistory.length;
    
    // Update last interview date
    stats.lastInterviewDate = interviewData.date;
    
    // Calculate current streak
    stats.currentStreak = this.calculateCurrentStreak(stats.performanceHistory);
    
    // Update skills breakdown
    stats.skillsBreakdown = this.calculateSkillsBreakdown(stats.performanceHistory);
    
    this.saveUserStats(stats);
  }

  // Calculate current streak - now counts consecutive days with interviews
  private calculateCurrentStreak(interviews: InterviewData[]): number {
    if (interviews.length === 0) return 0;
    
    const sortedInterviews = [...interviews].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < sortedInterviews.length; i++) {
      const interviewDate = new Date(sortedInterviews[i].date);
      interviewDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const daysDiff = Math.floor((currentDate.getTime() - interviewDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Interview on the same day, continue streak
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff === 1) {
        // Interview on consecutive day, continue streak
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap in days, break streak
        break;
      }
    }
    
    return streak;
  }

  // Calculate skills breakdown from interview history
  private calculateSkillsBreakdown(interviews: InterviewData[]): {
    technical: number;
    communication: number;
    problemSolving: number;
    leadership: number;
  } {
    if (interviews.length === 0) {
      return {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        leadership: 0
      };
    }
    
    const totals = interviews.reduce((acc, interview) => ({
      technical: acc.technical + interview.skills.technical,
      communication: acc.communication + interview.skills.communication,
      problemSolving: acc.problemSolving + interview.skills.problemSolving,
      leadership: acc.leadership + interview.skills.leadership
    }), { technical: 0, communication: 0, problemSolving: 0, leadership: 0 });
    
    return {
      technical: Math.round(totals.technical / interviews.length),
      communication: Math.round(totals.communication / interviews.length),
      problemSolving: Math.round(totals.problemSolving / interviews.length),
      leadership: Math.round(totals.leadership / interviews.length)
    };
  }

  // Get performance trend data for charts - now uses real data with proper dates
  getPerformanceTrend(): Array<{ name: string; score: number }> {
    const stats = this.getUserStats();
    const recentInterviews = stats.performanceHistory
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6); // Last 6 interviews for better trend visibility
    
    return recentInterviews.map((interview, index) => {
      const date = new Date(interview.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return {
        name: `${month} ${day}`,
        score: interview.score
      };
    });
  }

  // Get interview type breakdown for pie chart
  getInterviewTypeBreakdown(): Array<{ name: string; value: number; color: string }> {
    const stats = this.getUserStats();
    const typeCounts: { [key: string]: number } = {};
    
    // Count interviews by type
    stats.performanceHistory.forEach(interview => {
      typeCounts[interview.type] = (typeCounts[interview.type] || 0) + 1;
    });
    
    // Convert to array format for chart
    const colors = ['#007AFF', '#5AC8FA', '#FF9500', '#FF2D92', '#AF52DE', '#34C759'];
    let colorIndex = 0;
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
      color: colors[colorIndex++ % colors.length]
    }));
  }

  // Get skills data for charts
  getSkillsData(): Array<{ name: string; value: number; color: string }> {
    const stats = this.getUserStats();
    const skills = stats.skillsBreakdown;
    
    return [
      { name: 'Technical', value: skills.technical, color: '#8B5CF6' },
      { name: 'Communication', value: skills.communication, color: '#06B6D4' },
      { name: 'Problem Solving', value: skills.problemSolving, color: '#10B981' },
      { name: 'Leadership', value: skills.leadership, color: '#F59E0B' }
    ];
  }

  // Get average score
  getAverageScore(): number {
    const stats = this.getUserStats();
    if (stats.performanceHistory.length === 0) return 0;
    
    const totalScore = stats.performanceHistory.reduce((sum, interview) => sum + interview.score, 0);
    return Math.round(totalScore / stats.performanceHistory.length);
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem(this.USER_STATS_KEY);
    localStorage.removeItem(this.INTERVIEWS_KEY);
  }
}

export const localStorageService = new LocalStorageService(); 