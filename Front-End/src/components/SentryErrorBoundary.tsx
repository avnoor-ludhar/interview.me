import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// 🎯 MINIMAL ERROR BOUNDARY
const SentryErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded-md bg-gray-100 p-3">
                  <p className="text-sm font-medium text-gray-700">Error Details:</p>
                  <p className="text-xs text-gray-600 mt-1 font-mono">
                    {error instanceof Error ? error.message : String(error)}
                  </p>
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={resetError}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundary;