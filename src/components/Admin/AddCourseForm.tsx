
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddCourseFormProps {
  onAddCourse: (course: { name: string; description: string; order_index: number }) => void;
  onCancel: () => void;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onAddCourse, onCancel }) => {
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    order_index: 0
  });

  const handleSubmit = () => {
    if (!newCourse.name || !newCourse.description) {
      return;
    }
    onAddCourse(newCourse);
    setNewCourse({ name: '', description: '', order_index: 0 });
  };

  const handleCancel = () => {
    setNewCourse({ name: '', description: '', order_index: 0 });
    onCancel();
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Add New Course</CardTitle>
        <CardDescription className="text-muted-foreground">Create a new course for students</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-foreground">Course Name *</Label>
          <Input
            id="name"
            value={newCourse.name}
            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
            placeholder="Enter course name"
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-foreground">Course Description *</Label>
          <Textarea
            id="description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            placeholder="Enter course description"
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="order" className="text-foreground">Order Index</Label>
          <Input
            id="order"
            type="number"
            value={newCourse.order_index}
            onChange={(e) => setNewCourse({...newCourse, order_index: parseInt(e.target.value) || 0})}
            placeholder="Enter order index"
            className="bg-background border-border"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} className="bg-cyrobox-primary hover:bg-cyrobox-primary-dark">Create Course</Button>
          <Button variant="outline" onClick={handleCancel} className="border-border hover:border-cyrobox-primary hover:text-cyrobox-primary">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddCourseForm;
