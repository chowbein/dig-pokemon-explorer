/**
 * ErrorDisplay Component
 * Displays user-friendly error messages with optional retry functionality.
 */

import { PokemonAPIError } from '../../services/api';

interface ErrorDisplayProps {
  /** Error object (preferably PokemonAPIError for user-friendly messages) */
  error: Error | PokemonAPIError | null;
  /** Optional callback to retry the failed operation */
  onRetry?: () => void;
  /** Custom error message (overrides default error message) */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ErrorDisplay component for showing error states with retry functionality.
 * 
 * Features:
 * - Displays user-friendly error messages
 * - Shows special styling for server errors (500+)
 * - Provides retry button when onRetry callback is provided
 * - Supports different sizes
 * 
 * @param error - Error object to display
 * @param onRetry - Optional callback for retry button
 * @param message - Custom message to override error message
 * @param size - Size variant (sm, md, lg)
 */
export function ErrorDisplay({ 
  error, 
  onRetry, 
  message,
  size = 'md' 
}: ErrorDisplayProps) {
  // Determine the message to display
  const displayMessage = message || 
    (error instanceof PokemonAPIError ? error.userMessage : error?.message) || 
    'An unexpected error occurred';

  // Check if it's a server error for special styling
  const isServerError = error instanceof PokemonAPIError && error.isServerError;

  // Size-specific classes
  const sizeClasses = {
    sm: {
      container: 'min-h-[200px] gap-2',
      title: 'text-base',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm',
    },
    md: {
      container: 'min-h-[400px] gap-4',
      title: 'text-lg',
      message: 'text-base',
      button: 'px-4 py-2 text-base',
    },
    lg: {
      container: 'min-h-[500px] gap-6',
      title: 'text-xl',
      message: 'text-lg',
      button: 'px-6 py-3 text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col justify-center items-center ${classes.container}`}>
      {/* Error Icon */}
      <div className={`${isServerError ? 'text-orange-500' : 'text-red-600'} dark:text-red-400`}>
        <svg 
          className={size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20'} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>

      {/* Error Title */}
      <div className={`${isServerError ? 'text-orange-600' : 'text-red-600'} dark:text-red-400 ${classes.title} font-semibold`}>
        {isServerError ? 'Service Unavailable' : 'Error Loading Data'}
      </div>

      {/* Error Message */}
      <p className={`text-gray-600 dark:text-gray-400 ${classes.message} text-center max-w-md px-4`}>
        {displayMessage}
      </p>

      {/* Server Error Additional Info */}
      {isServerError && (
        <p className="text-gray-500 dark:text-gray-500 text-sm text-center max-w-md px-4">
          The PokeAPI may be experiencing downtime or maintenance. This is usually temporary.
        </p>
      )}

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`${classes.button} font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2`}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Try Again
        </button>
      )}

      {/* Technical Details (in dev mode) */}
      {import.meta.env.DEV && error && (
        <details className="mt-4 text-xs text-gray-500 dark:text-gray-600 max-w-2xl">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-400">
            Technical Details
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            {error.message}
            {error instanceof PokemonAPIError && error.statusCode && (
              `\nStatus Code: ${error.statusCode}`
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

