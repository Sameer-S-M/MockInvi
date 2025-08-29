import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testLocalStorage, clearTestData } from '@/utils/testLocalStorage';

const TestLocalStorage: React.FC = () => {
  const handleTest = () => {
    const results = testLocalStorage();
    console.log('Test Results:', results);
    alert('Check console for test results!');
  };

  const handleClear = () => {
    clearTestData();
    alert('Test data cleared!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Local Storage Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTest} className="w-full">
          Run Local Storage Test
        </Button>
        <Button onClick={handleClear} variant="outline" className="w-full">
          Clear Test Data
        </Button>
        <p className="text-sm text-muted-foreground">
          Check the browser console for detailed test results.
        </p>
      </CardContent>
    </Card>
  );
};

export default TestLocalStorage; 