
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle, Award, Video, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Removed ProFeatureGuard import
import SimpleAssessment from '@/components/Learning/SimpleAssessment';
import { useSimpleLearning } from '@/hooks/useSimpleLearning';
import { Course, CourseVideo } from '@/services/courseService';
import { videoPlayerUtils } from '@/utils/videoPlayerUtils';

const LearningPage: React.FC = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentCourse, setAssessmentCourse] = useState<{ id: string; name: string } | null>(null);

  const {
    courses,
    videos,
    loading,
    error,
    toggleVideoCompletion,
    getCourseProgress,
    isCourseCompleted,
    isVideoCompleted,
    courseHasQuestions,
    getAssessmentStatus,
    getCachedVideoUrl
  } = useSimpleLearning();

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !isStudent()) {
    return <Navigate to="/login" />;
  }

  const handleStartAssessment = async (course: Course) => {
    const hasQuestions = await courseHasQuestions(course.id);
    if (!hasQuestions) {
      return;
    }
    
    setAssessmentCourse({ id: course.id, name: course.name });
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (passed: boolean, score: number) => {
    setShowAssessment(false);
    setAssessmentCourse(null);
    window.location.reload();
  };

  const handleVideoClick = (video: CourseVideo) => {
    // swap URL with cached blob if available
    const cachedUrl = getCachedVideoUrl(video.id, video.video_url);
    setSelectedVideo({ ...video, video_url: cachedUrl });
  };

  const handleBackToCourse = () => {
    setSelectedVideo(null);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedVideo(null);
  };

  const renderSelectedVideo = () => {
    if (!selectedVideo) return null;
    const source = videoPlayerUtils.parseVideoUrl(selectedVideo.video_url);

    if (source.type === 'youtube' || source.type === 'vimeo') {
      return (
        <div className="w-full aspect-video">
          <iframe
            src={source.embedUrl}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedVideo.title}
          />
        </div>
      );
    }

    // drive/direct -> use HTML5 video
    const playableUrl = source.embedUrl || selectedVideo.video_url;
    return (
      <video
        key={selectedVideo.id}
        src={playableUrl}
        poster={selectedVideo.thumbnail_url}
        controls
        autoPlay
        playsInline
        preload="auto"
        className="w-full rounded-lg"
        onError={(e) => {
          console.error('Video failed to load', selectedVideo);
          (e.currentTarget as HTMLVideoElement).controls = true;
        }}
      />
    );
  };

  // Show assessment if active
  if (showAssessment && assessmentCourse) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment</h1>
            <p className="mt-2 text-muted-foreground">
              Complete the assessment for {assessmentCourse.name}
            </p>
          </div>
          {/* Unguarded assessment content */}
          <SimpleAssessment
            courseId={assessmentCourse.id}
            courseName={assessmentCourse.name}
            totalModules={videos[assessmentCourse.id]?.length || 0}
            onComplete={handleAssessmentComplete}
            onCancel={() => {
              setShowAssessment(false);
              setAssessmentCourse(null);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Show course detail view
  if (selectedCourse) {
    const courseVideos = videos[selectedCourse.id] || [];
    const progress = getCourseProgress(selectedCourse.id);
    const completed = isCourseCompleted(selectedCourse.id);
    const assessmentStatus = getAssessmentStatus(selectedCourse.id);

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToCourses}>
              ← Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{selectedCourse.name}</h1>
              <p className="mt-2 text-muted-foreground">
                {selectedCourse.description}
              </p>
            </div>
          </div>

          {/* Video Player when a video is selected */}
          {selectedVideo && (
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">{selectedVideo.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleBackToCourse}>Close</Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderSelectedVideo()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Course Progress</h2>
                  <p className="text-muted-foreground">
                    {progress}% complete
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={completed ? "default" : "secondary"}>
                    {progress}%
                  </Badge>
                </div>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent>
              {completed && !assessmentStatus.isCompleted ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Course Completed!</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    You can now take the assessment to earn your certificate.
                  </p>
                  <Button 
                    onClick={() => handleStartAssessment(selectedCourse)}
                    className="mt-2"
                    size="sm"
                  >
                    Start Assessment
                  </Button>
                </div>
              ) : assessmentStatus.isCompleted ? (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Assessment Completed!</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Congratulations! You've earned your certificate for this course.
                  </p>
                  {assessmentStatus.score && (
                    <p className="text-green-600 text-sm mt-1">
                      Final Score: {assessmentStatus.score}%
                    </p>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Course Videos</h2>
            {courseVideos.map((video, index) => (
              <Card key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="w-16 h-10 rounded-md object-cover" />
                        ) : (
                          <div className="w-16 h-10 rounded-md bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {index + 1}.
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {video.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVideoCompletion(selectedCourse.id, video.id);
                      }}
                      variant={isVideoCompleted(selectedCourse.id, video.id) ? "default" : "outline"}
                      size="sm"
                    >
                      {isVideoCompleted(selectedCourse.id, video.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show courses list (main view)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a course to start learning and earn certificates
          </p>
        </div>
        
        {/* Unguarded main course list */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = getCourseProgress(course.id);
            const videoCount = videos[course.id]?.length || 0;
            const completed = isCourseCompleted(course.id);
            const assessmentStatus = getAssessmentStatus(course.id);

            return (
              <Card 
                key={course.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-3">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg.white/5 flex items-center justify-center">
                          <Video className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      {course.name}
                    </CardTitle>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={completed ? "default" : "secondary"}>
                        {progress}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {course.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={progress} className="h-2" />
                     <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{videoCount} videos</span>
                      {assessmentStatus.isCompleted ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : completed ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Award className="w-3 h-3 mr-1" />
                          Ready for Assessment
                        </Badge>
                      ) : null}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={assessmentStatus.isCompleted ? "default" : completed ? "default" : "outline"}
                      disabled={assessmentStatus.isCompleted}
                    >
                      {assessmentStatus.isCompleted 
                        ? "Course Completed" 
                        : progress === 0 
                          ? "Start Course" 
                          : completed 
                            ? "Take Assessment" 
                            : "Continue"
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {courses.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium mb-2">No courses available</h3>
              <p className="text-muted-foreground">
                Check back later for new learning content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LearningPage;
