
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Video, Edit, Trash2, Save, X, HelpCircle } from 'lucide-react';
import { Course, CourseVideo } from '@/services/courseService';
import { CourseQuestion } from '@/services/questionService';
import VideoListItem from './VideoListItem';
import QuestionListItem from './QuestionListItem';

interface CourseCardProps {
  course: Course;
  videos: CourseVideo[];
  questions: CourseQuestion[];
  isEditing: boolean;
  editingCourse: Course | null;
  editingVideo: CourseVideo | null;
  editingQuestion: CourseQuestion | null;
  onEditCourse: (course: Course) => void;
  onSaveCourse: (course: Course) => void;
  onCancelEditCourse: () => void;
  onEditVideo: (video: CourseVideo) => void;
  onSaveVideo: (video: CourseVideo) => void;
  onCancelEditVideo: () => void;
  onEditQuestion: (question: CourseQuestion) => void;
  onSaveQuestion: (question: CourseQuestion) => void;
  onCancelEditQuestion: () => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteVideo: (videoId: string, courseId: string) => void;
  onDeleteQuestion: (questionId: string, courseId: string) => void;
  onAddVideo: (course: Course) => void;
  onAddQuestion: (course: Course) => void;
  onEditingCourseChange: (course: Course | null) => void;
  onEditingVideoChange: (video: CourseVideo | null) => void;
  onEditingQuestionChange: (question: CourseQuestion | null) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  videos,
  questions,
  isEditing,
  editingCourse,
  editingVideo,
  editingQuestion,
  onEditCourse,
  onSaveCourse,
  onCancelEditCourse,
  onEditVideo,
  onSaveVideo,
  onCancelEditVideo,
  onEditQuestion,
  onSaveQuestion,
  onCancelEditQuestion,
  onDeleteCourse,
  onDeleteVideo,
  onDeleteQuestion,
  onAddVideo,
  onAddQuestion,
  onEditingCourseChange,
  onEditingVideoChange,
  onEditingQuestionChange
}) => {
  return (
    <Card className="border-2 border-border hover:border-cyrobox-primary/30 transition-colors">
      <CardHeader>
        {isEditing && editingCourse ? (
          <div className="space-y-2">
            <Input
              value={editingCourse.name}
              onChange={(e) => onEditingCourseChange({...editingCourse, name: e.target.value})}
              className="font-semibold bg-background border-border"
              placeholder="Course name"
            />
            <Textarea
              value={editingCourse.description || ''}
              onChange={(e) => onEditingCourseChange({...editingCourse, description: e.target.value})}
              className="text-sm bg-background border-border"
              placeholder="Course description"
            />
            <Input
              type="number"
              value={editingCourse.order_index}
              onChange={(e) => onEditingCourseChange({...editingCourse, order_index: parseInt(e.target.value) || 0})}
              placeholder="Order index"
              className="bg-background border-border"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => onSaveCourse(editingCourse)} className="bg-cyrobox-primary hover:bg-cyrobox-primary-dark">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEditCourse} className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <CardTitle className="text-lg text-cyrobox-primary">{course.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{course.description}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/20 dark:text-green-300">
              <Video className="w-3 h-3 mr-1" />
              {videos?.length || 0} videos
            </span>
            <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-300">
              <HelpCircle className="w-3 h-3 mr-1" />
              {questions?.length || 0} questions
            </span>
            <span className="text-xs text-muted-foreground">Order: {course.order_index}</span>
          </div>
        </div>
        
        {videos?.length > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="font-medium text-sm text-foreground">Recent Videos:</h4>
            {videos.slice(0, 2).map((video) => (
              <div key={video.id} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded border border-border">
                <VideoListItem
                  video={video}
                  isEditing={editingVideo?.id === video.id}
                  editingVideo={editingVideo}
                  onEdit={onEditVideo}
                  onSave={onSaveVideo}
                  onCancel={onCancelEditVideo}
                  onDelete={onDeleteVideo}
                  onEditingChange={onEditingVideoChange}
                />
              </div>
            ))}
            {videos.length > 2 && (
              <p className="text-xs text-muted-foreground pl-2">+ {videos.length - 2} more videos</p>
            )}
          </div>
        )}

        {questions?.length > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="font-medium text-sm text-foreground">Recent Questions:</h4>
            {questions.slice(0, 2).map((question) => (
              <div key={question.id} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded border border-border">
                <QuestionListItem
                  question={question}
                  isEditing={editingQuestion?.id === question.id}
                  editingQuestion={editingQuestion}
                  onEdit={onEditQuestion}
                  onSave={onSaveQuestion}
                  onCancel={onCancelEditQuestion}
                  onDelete={onDeleteQuestion}
                  onEditingChange={onEditingQuestionChange}
                />
              </div>
            ))}
            {questions.length > 2 && (
              <p className="text-xs text-muted-foreground pl-2">+ {questions.length - 2} more questions</p>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onAddVideo(course)}
            className="bg-cyrobox-primary hover:bg-cyrobox-primary-dark"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Video
          </Button>
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onAddQuestion(course)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEditCourse(course)}
            className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Course
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDeleteCourse(course.id)}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:border-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
