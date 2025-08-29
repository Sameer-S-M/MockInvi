import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { courseService, Course, CourseVideo } from '@/services/courseService';
import { learningService } from '@/services/learningService';
import { videoCache } from '@/services/videoCache';

interface SimpleLearningData {
  courses: Course[];
  videos: Record<string, CourseVideo[]>;
  progress: Record<string, Record<string, boolean>>;
  assessmentStatus: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export const useSimpleLearning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<SimpleLearningData>({
    courses: [],
    videos: {},
    progress: {},
    assessmentStatus: {},
    loading: true,
    error: null
  });

  const getLocalProgressKey = (uid?: string) => `learning_progress_${uid || user?.id}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const courses = await courseService.fetchCourses();

        const videoPromises = courses.map(async (course) => ({
          course,
          videos: await courseService.fetchVideosByCourse(course.id)
        }));

        const coursesWithVideosData = await Promise.all(videoPromises);

        const coursesWithVideos: Course[] = [];
        const videosMap: Record<string, CourseVideo[]> = {};

        for (const { course, videos } of coursesWithVideosData) {
          if (videos.length > 0) {
            coursesWithVideos.push(course);
            videosMap[course.id] = videos;
          }
        }

        // Prefetch videos
        for (const course of coursesWithVideos) {
          const vList = videosMap[course.id] || [];
          vList.forEach(v => { videoCache.prefetch(v.id, v.video_url); });
        }

        // Load local progress immediately
        const savedProgress = localStorage.getItem(getLocalProgressKey());
        const localProgress = savedProgress ? JSON.parse(savedProgress) : {};

        const progressMap: Record<string, Record<string, boolean>> = {};
        const assessmentStatusMap: Record<string, any> = {};

        for (const course of coursesWithVideos) {
          try {
            const serverData = user
              ? await learningService.fetchUserLearningData(
                  user.id,
                  videosMap[course.id].length,
                  course.id
                )
              : null;

            if (serverData?.progress) {
              progressMap[course.id] = { ...localProgress[course.id], ...serverData.progress };
            } else {
              progressMap[course.id] = localProgress[course.id] || {};
            }

            assessmentStatusMap[course.id] = {
              isCompleted: serverData?.assessment_passed || false,
              score: serverData?.assessment_score || undefined,
              passed: serverData?.assessment_passed || false,
              attempted: serverData?.assessment_attempted || false
            };
          } catch (error) {
            progressMap[course.id] = localProgress[course.id] || {};
            assessmentStatusMap[course.id] = {
              isCompleted: false,
              score: undefined,
              passed: false,
              attempted: false
            };
          }
        }

        setData({
          courses: coursesWithVideos,
          videos: videosMap,
          progress: progressMap,
          assessmentStatus: assessmentStatusMap,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error loading learning data:', error);
        setData(prev => ({ ...prev, loading: false, error: 'Failed to load learning content' }));
      }
    };

    loadData();
    // no cleanup
  }, [user]);

  const persistProgress = (progress: Record<string, Record<string, boolean>>) => {
    try {
      localStorage.setItem(getLocalProgressKey(), JSON.stringify(progress));
    } catch {}
  };

  const getCourseProgress = (courseId: string): number => {
    const courseVideos = data.videos[courseId] || [];
    const completed = Object.values(data.progress[courseId] || {}).filter(Boolean).length;
    if (courseVideos.length === 0) return 0;
    return Math.round((completed / courseVideos.length) * 100);
  };

  const isCourseCompleted = (courseId: string): boolean => {
    const courseVideos = data.videos[courseId] || [];
    if (courseVideos.length === 0) return false;
    const progress = data.progress[courseId] || {};
    return courseVideos.every(v => progress[v.id]);
  };

  const isVideoCompleted = (courseId: string, videoId: string): boolean => {
    return Boolean((data.progress[courseId] || {})[videoId]);
  };

  const toggleVideoCompletion = async (courseId: string, videoId: string) => {
    setData(prev => {
      const next = { ...prev };
      const courseProgress = { ...(next.progress[courseId] || {}) };
      courseProgress[videoId] = !courseProgress[videoId];
      next.progress = { ...next.progress, [courseId]: courseProgress };
      persistProgress(next.progress);
      // best-effort server sync
      try {
        if (user) {
          const total = next.videos[courseId]?.length || 0;
          const completedCount = Object.values(courseProgress).filter(Boolean).length;
          learningService.updateModuleProgress(
            user.id,
            courseId,
            courseProgress,
            completedCount,
            total
          ).catch(() => {});
        }
      } catch {}
      return { ...next };
    });
  };

  const courseHasQuestions = async (courseId: string): Promise<boolean> => {
    // If server has assessment_completed info, rely on that existence later.
    // Here we just check if course exists; actual questions fetch happens in assessment component.
    return Boolean(data.videos[courseId]?.length);
  };

  const getAssessmentStatus = (courseId: string) => {
    return data.assessmentStatus[courseId] || { isCompleted: false };
  };

  const getCachedVideoUrl = (videoId: string, originalUrl: string) => {
    return videoCache.getUrl(videoId) || originalUrl;
  };

  return {
    courses: data.courses,
    videos: data.videos,
    loading: data.loading,
    error: data.error,
    toggleVideoCompletion,
    getCourseProgress,
    isCourseCompleted,
    isVideoCompleted,
    courseHasQuestions,
    getAssessmentStatus,
    getCachedVideoUrl,
  };
};