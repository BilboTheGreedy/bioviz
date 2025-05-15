import { useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { AlertOctagon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
    }
  }, [error]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertOctagon className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          An error occurred while rendering this component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm bg-muted p-2 rounded-md overflow-auto max-h-24">
          {error.message}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </CardFooter>
    </Card>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const onError = (error: Error) => {
    toast.error('An error occurred', {
      description: error.message,
    });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}