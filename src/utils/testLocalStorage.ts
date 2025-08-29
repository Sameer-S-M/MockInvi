import { localStorageService } from './localStorageService';

// Test function to verify local storage functionality
export const testLocalStorage = () => {
  console.log('Testing Local Storage Service...');
  
  // Clear existing data
  localStorageService.clearAllData();
  
  // Test initial state
  const initialStats = localStorageService.getUserStats();
  console.log('Initial stats:', initialStats);
  
  // Add some test interview results
  const testInterviews = [
    {
      id: 'test_1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      score: 85,
      type: 'basic_hr_technical',
      skills: {
        technical: 90,
        communication: 80,
        problemSolving: 85,
        leadership: 75
      }
    },
    {
      id: 'test_2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      score: 78,
      type: 'role_based',
      skills: {
        technical: 85,
        communication: 75,
        problemSolving: 80,
        leadership: 70
      }
    },
    {
      id: 'test_3',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      score: 92,
      type: 'resume_based',
      skills: {
        technical: 95,
        communication: 90,
        problemSolving: 88,
        leadership: 85
      }
    },
    {
      id: 'test_4',
      date: new Date().toISOString(), // today
      score: 88,
      type: 'basic_hr_technical',
      skills: {
        technical: 90,
        communication: 85,
        problemSolving: 90,
        leadership: 80
      }
    }
  ];
  
  // Add each test interview
  testInterviews.forEach(interview => {
    localStorageService.addInterviewResult(interview);
  });
  
  // Get updated stats
  const updatedStats = localStorageService.getUserStats();
  console.log('Updated stats:', updatedStats);
  
  // Test performance trend
  const performanceTrend = localStorageService.getPerformanceTrend();
  console.log('Performance trend:', performanceTrend);
  
  // Test skills data
  const skillsData = localStorageService.getSkillsData();
  console.log('Skills data:', skillsData);
  
  // Test average score
  const averageScore = localStorageService.getAverageScore();
  console.log('Average score:', averageScore);
  
  console.log('Local Storage Test Complete!');
  
  return {
    stats: updatedStats,
    performanceTrend,
    skillsData,
    averageScore
  };
};

// Function to clear test data
export const clearTestData = () => {
  localStorageService.clearAllData();
  console.log('Test data cleared');
}; 