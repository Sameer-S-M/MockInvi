import { InterviewData } from './localStorageService';

// Sample interview types
const INTERVIEW_TYPES = [
  'Custom Interview',
  'Basic Interview', 
  'Resume Based Interview',
  'Technical Interview',
  'Behavioral Interview',
  'Case Study Interview'
];

// Sample skills data
const generateSkills = () => ({
  technical: Math.floor(Math.random() * 40) + 60, // 60-100
  communication: Math.floor(Math.random() * 40) + 60, // 60-100
  problemSolving: Math.floor(Math.random() * 40) + 60, // 60-100
  leadership: Math.floor(Math.random() * 40) + 60 // 60-100
});

// Generate sample interview data for the last 30 days
export const generateSampleInterviewData = (): InterviewData[] => {
  const interviews: InterviewData[] = [];
  const today = new Date();
  
  // Generate interviews for the last 30 days with some gaps to test streak calculation
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Randomly decide if there's an interview on this day (70% chance)
    if (Math.random() < 0.7) {
      const interview: InterviewData = {
        id: `interview-${Date.now()}-${i}`,
        date: date.toISOString(),
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        type: INTERVIEW_TYPES[Math.floor(Math.random() * INTERVIEW_TYPES.length)],
        skills: generateSkills()
      };
      
      interviews.push(interview);
    }
  }
  
  return interviews;
};

// Generate a single interview result for testing
export const generateSingleInterview = (): InterviewData => {
  return {
    id: `interview-${Date.now()}`,
    date: new Date().toISOString(),
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    type: INTERVIEW_TYPES[Math.floor(Math.random() * INTERVIEW_TYPES.length)],
    skills: generateSkills()
  };
};

// Generate performance trend data
export const generatePerformanceTrend = (count: number = 6): Array<{ name: string; score: number }> => {
  const trend = [];
  const today = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trend.push({
      name: `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`,
      score: Math.floor(Math.random() * 40) + 60
    });
  }
  
  return trend;
};

// Generate interview type breakdown
export const generateInterviewTypeBreakdown = (): Array<{ name: string; value: number; color: string }> => {
  const colors = ['#007AFF', '#5AC8FA', '#FF9500', '#FF2D92', '#AF52DE', '#34C759'];
  
  return INTERVIEW_TYPES.map((type, index) => ({
    name: type,
    value: Math.floor(Math.random() * 5) + 1, // 1-5 interviews
    color: colors[index % colors.length]
  }));
};

// Populate localStorage with sample data for testing
export const populateSampleData = () => {
  const sampleInterviews = generateSampleInterviewData();
  
  // Clear existing data
  localStorage.removeItem('mockinvi_user_stats');
  
  // Create user stats with sample data
  const userStats = {
    interviewCount: sampleInterviews.length,
    currentStreak: 0, // Will be calculated by the service
    lastInterviewDate: sampleInterviews.length > 0 ? sampleInterviews[sampleInterviews.length - 1].date : null,
    performanceHistory: sampleInterviews,
    skillsBreakdown: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      leadership: 0
    }
  };
  
  // Save to localStorage
  localStorage.setItem('mockinvi_user_stats', JSON.stringify(userStats));
  
  console.log('Sample data populated:', userStats);
  return userStats;
};

// Clear all sample data
export const clearSampleData = () => {
  localStorage.removeItem('mockinvi_user_stats');
  console.log('Sample data cleared');
}; 