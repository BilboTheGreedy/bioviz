import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'object' && error !== null && 'statusText' in error
    ? String(error.statusText)
    : 'An unknown error occurred';

  const errorStatus = typeof error === 'object' && error !== null && 'status' in error
    ? Number(error.status)
    : null;

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>
              {errorStatus ? `Error ${errorStatus}` : 'Something went wrong'}
            </CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred while loading this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm bg-muted p-3 rounded-md overflow-auto max-h-32">
            {errorMessage}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/', { replace: true })}
          >
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}