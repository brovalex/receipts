'use client';

import { Alert, Button } from 'flowbite-react';
import { HiExclamation, HiRefresh } from 'react-icons/hi';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  onRetry,
  className = '',
}: ErrorDisplayProps) {
  return (
    <Alert color="failure" className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <HiExclamation className="h-5 w-5" />
          <span className="font-medium">{title}</span>
        </div>
        <p>{message}</p>
        {onRetry && (
          <Button size="xs" color="failure" onClick={onRetry}>
            <HiRefresh className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </Alert>
  );
}

interface FullPageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function FullPageError({
  title = 'Something went wrong',
  message,
  onRetry,
}: FullPageErrorProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4 p-4">
      <div className="text-red-500">
        <HiExclamation className="h-16 w-16" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          <HiRefresh className="mr-2 h-5 w-5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
