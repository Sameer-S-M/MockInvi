import { supabase } from '@/integrations/supabase/client';

export interface AdminCourse {
  id: string;
  name: string;
  description: string;
  thumbnail_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCourseVideo {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
  is_active: boolean;
  content_type?: string;
  file_path?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCourseQuestion {
  id: string;
  course_id: string;
  question_text: string;
  difficulty_level: 'easy' | 'intermediate' | 'hard';
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
  explanation?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Admin service that bypasses RLS policies
export const adminService = {
  // Course Management
  async addCourse(course: Omit<AdminCourse, 'id' | 'created_at' | 'updated_at'>): Promise<AdminCourse> {
    try {
      console.log('Admin adding course:', course);
      
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...course,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Admin error adding course:', error);
        throw new Error(`Failed to add course: ${error.message}`);
      }

      return data as AdminCourse;
    } catch (error) {
      console.error('Error in admin addCourse:', error);
      throw error as any;
    }
  },

  async updateCourse(courseId: string, updates: Partial<AdminCourse>): Promise<AdminCourse> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select('*')
        .single();

      if (error) {
        console.error('Admin error updating course:', error);
        throw new Error(`Failed to update course: ${error.message}`);
      }

      return data as AdminCourse;
    } catch (error) {
      console.error('Error in admin updateCourse:', error);
      throw error as any;
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      // First delete all related videos and questions
      await this.deleteAllVideosForCourse(courseId);
      await this.deleteAllQuestionsForCourse(courseId);
      
      // Then delete the course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Admin error deleting course:', error);
        throw new Error(`Failed to delete course: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in admin deleteCourse:', error);
      throw error as any;
    }
  },

  async fetchAllCourses(): Promise<AdminCourse[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Admin error fetching courses:', error);
        return [];
      }

      return (data as any) || [];
    } catch (error) {
      console.error('Error in admin fetchAllCourses:', error);
      return [];
    }
  },

  // Video Management
  async addVideo(video: Omit<AdminCourseVideo, 'id' | 'created_at' | 'updated_at'>): Promise<AdminCourseVideo> {
    try {
      console.log('Admin adding video:', video);
      
      const { data, error } = await supabase
        .from('course_videos')
        .insert({
          ...video,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Admin error adding video:', error);
        throw new Error(`Failed to add video: ${error.message}`);
      }

      return data as AdminCourseVideo;
    } catch (error) {
      console.error('Error in admin addVideo:', error);
      throw error as any;
    }
  },

  async updateVideo(videoId: string, updates: Partial<AdminCourseVideo>): Promise<AdminCourseVideo> {
    try {
      const { data, error } = await supabase
        .from('course_videos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId)
        .select('*')
        .single();

      if (error) {
        console.error('Admin error updating video:', error);
        throw new Error(`Failed to update video: ${error.message}`);
      }

      return data as AdminCourseVideo;
    } catch (error) {
      console.error('Error in admin updateVideo:', error);
      throw error as any;
    }
  },

  async deleteVideo(videoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error('Admin error deleting video:', error);
        throw new Error(`Failed to delete video: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in admin deleteVideo:', error);
      throw error as any;
    }
  },

  async deleteAllVideosForCourse(courseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_videos')
        .delete()
        .eq('course_id', courseId);

      if (error) {
        console.error('Admin error deleting videos for course:', error);
        throw new Error(`Failed to delete videos for course: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in admin deleteAllVideosForCourse:', error);
      throw error as any;
    }
  },

  async fetchAllVideos(): Promise<Record<string, AdminCourseVideo[]>> {
    try {
      const { data, error } = await supabase
        .from('course_videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Admin error fetching videos:', error);
        return {};
      }

      const videos = (data as any) || [];
      const videosByCourse: Record<string, AdminCourseVideo[]> = {};
      
      videos.forEach((video: AdminCourseVideo) => {
        if (!videosByCourse[video.course_id]) {
          videosByCourse[video.course_id] = [];
        }
        videosByCourse[video.course_id].push(video);
      });

      return videosByCourse;
    } catch (error) {
      console.error('Error in admin fetchAllVideos:', error);
      return {};
    }
  },

  // Question Management
  async addQuestion(question: Omit<AdminCourseQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<AdminCourseQuestion> {
    try {
      console.log('Admin adding question:', question);
      
      const { data, error } = await supabase
        .from('course_questions')
        .insert({
          ...question,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Admin error adding question:', error);
        throw new Error(`Failed to add question: ${error.message}`);
      }

      return data as AdminCourseQuestion;
    } catch (error) {
      console.error('Error in admin addQuestion:', error);
      throw error as any;
    }
  },

  async updateQuestion(questionId: string, updates: Partial<AdminCourseQuestion>): Promise<AdminCourseQuestion> {
    try {
      const { data, error } = await supabase
        .from('course_questions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .select('*')
        .single();

      if (error) {
        console.error('Admin error updating question:', error);
        throw new Error(`Failed to update question: ${error.message}`);
      }

      return data as AdminCourseQuestion;
    } catch (error) {
      console.error('Error in admin updateQuestion:', error);
      throw error as any;
    }
  },

  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Admin error deleting question:', error);
        throw new Error(`Failed to delete question: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in admin deleteQuestion:', error);
      throw error as any;
    }
  },

  async deleteAllQuestionsForCourse(courseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_questions')
        .delete()
        .eq('course_id', courseId);

      if (error) {
        console.error('Admin error deleting questions for course:', error);
        throw new Error(`Failed to delete questions for course: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in admin deleteAllQuestionsForCourse:', error);
      throw error as any;
    }
  },

  async fetchAllQuestions(): Promise<Record<string, AdminCourseQuestion[]>> {
    try {
      const { data, error } = await supabase
        .from('course_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Admin error fetching questions:', error);
        return {};
      }

      const questions = (data as any) || [];
      const questionsByCourse: Record<string, AdminCourseQuestion[]> = {};
      
      questions.forEach((question: AdminCourseQuestion) => {
        if (!questionsByCourse[question.course_id]) {
          questionsByCourse[question.course_id] = [];
        }
        questionsByCourse[question.course_id].push(question);
      });

      return questionsByCourse;
    } catch (error) {
      console.error('Error in admin fetchAllQuestions:', error);
      return {};
    }
  }
};
