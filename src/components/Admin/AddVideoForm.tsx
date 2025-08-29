
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { AdminCourse } from '@/services/adminService';
import { videoPlayerUtils } from '@/utils/videoPlayerUtils';
import { X, Upload, Link, Play, AlertCircle } from 'lucide-react';

interface AddVideoFormProps {
  selectedCourse: AdminCourse;
  onAddVideo: (videoData: {
    title: string;
    description: string;
    video_url: string;
    duration: string;
    order_index: number;
    content_type: string;
    file_path?: string;
    file_size?: number;
    thumbnail_url?: string;
  }) => void;
  onCancel: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({
  selectedCourse,
  onAddVideo,
  onCancel
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: '',
    order_index: 0
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('url');
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_index' ? parseInt(value) || 0 : value
    }));

    // Validate URL when it changes
    if (name === 'video_url') {
      validateVideoUrl(value);
    }
  };

  const validateVideoUrl = (url: string) => {
    if (!url.trim()) {
      setUrlValidation({ isValid: true, message: '' });
      return;
    }

    try {
      const isValid = videoPlayerUtils.isValidVideoUrl(url);
      if (isValid) {
        const videoType = videoPlayerUtils.getVideoTypeDisplay(url);
        setUrlValidation({ 
          isValid: true, 
          message: `✅ Valid ${videoType} URL detected` 
        });
      } else {
        setUrlValidation({ 
          isValid: false, 
          message: '❌ Invalid video URL format' 
        });
      }
    } catch {
      setUrlValidation({ 
        isValid: false, 
        message: '❌ Invalid video URL format' 
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        // Auto-fill title if empty
        if (!formData.title) {
          setFormData(prev => ({
            ...prev,
            title: selectedFile.name.replace(/\.[^/.]+$/, '')
          }));
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, WebM, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a video title",
        variant: "destructive"
      });
      return false;
    }

    if (activeTab === 'url') {
      if (!formData.video_url.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a video URL",
          variant: "destructive"
        });
        return false;
      }

      if (!urlValidation.isValid) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid video URL",
          variant: "destructive"
        });
        return false;
      }
    } else {
      if (!file) {
        toast({
          title: "Validation Error",
          description: "Please select a video file",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: activeTab === 'url' ? formData.video_url.trim() : '',
        duration: formData.duration.trim(),
        order_index: formData.order_index,
        content_type: activeTab === 'url' ? 'url' : 'file',
        file_path: activeTab === 'file' ? file?.name : undefined,
        file_size: activeTab === 'file' ? file?.size : undefined,
        thumbnail_url: activeTab === 'url' ? 
          (() => {
            try {
              const videoSource = videoPlayerUtils.parseVideoUrl(formData.video_url.trim());
              return videoSource.thumbnailUrl;
            } catch {
              return undefined;
            }
          })() : undefined
      };

      await onAddVideo(videoData);
    } catch (error) {
      console.error('Error submitting video:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add Video to "{selectedCourse.name}"</h3>
            <p className="text-sm text-muted-foreground">Upload a video file or provide a video URL (supports YouTube, Vimeo, Google Drive, and direct links)</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="text-foreground">Video URL</TabsTrigger>
              <TabsTrigger value="file" className="text-foreground">Upload File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="video_url" className="text-foreground">Video URL *</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..., https://drive.google.com/file/d/..., or direct video link"
                  required
                  className={`bg-background border-border ${!urlValidation.isValid ? 'border-red-500' : ''}`}
                />
                {urlValidation.message && (
                  <p className={`text-xs mt-1 ${urlValidation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {urlValidation.message}
                  </p>
                )}
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Supported Video Sources:</p>
                      <ul className="space-y-1">
                        <li>• <strong>YouTube:</strong> youtube.com/watch?v=... or youtu.be/...</li>
                        <li>• <strong>Vimeo:</strong> vimeo.com/...</li>
                        <li>• <strong>Google Drive:</strong> drive.google.com/file/d/... or drive.google.com/open?id=...</li>
                        <li>• <strong>Direct Links:</strong> Any .mp4, .webm, .mov, .avi, .mkv file URL</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label htmlFor="video_file" className="text-foreground">Video File *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-cyrobox-primary/50 transition-colors">
                  <input
                    type="file"
                    id="video_file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="video_file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-cyrobox-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, WebM, MOV, AVI, MKV up to 100MB
                    </p>
                  </label>
                </div>
                
                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Play className="w-5 h-5 text-cyrobox-primary" />
                      <span className="text-sm text-foreground font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="title" className="text-foreground">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              required
              className="bg-background border-border"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter video description (optional)"
              rows={3}
              className="bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-foreground">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 10:30 or 5 minutes"
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="order_index" className="text-foreground">Order</Label>
              <Input
                id="order_index"
                name="order_index"
                type="number"
                value={formData.order_index}
                onChange={handleInputChange}
                min="0"
                className="bg-background border-border"
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Uploading video...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={uploading || submitting || (activeTab === 'url' && !urlValidation.isValid)}
              className="flex-1 bg-cyrobox-primary hover:bg-cyrobox-primary-dark"
            >
              {uploading ? 'Adding Video...' : 'Add Video'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={uploading || submitting}
              className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddVideoForm;
