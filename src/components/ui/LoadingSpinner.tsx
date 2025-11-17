/**
 * Loading Spinner Component
 * Simple CSS-based loading animation using Tailwind CSS utilities.
 */

interface LoadingSpinnerProps {
  /** Optional size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional text to display below spinner */
  text?: string;
}

/**
 * Animated loading spinner using CSS keyframe animation.
 * Uses Tailwind's animate-spin utility for smooth rotation.
 * 
 * @param size - Size variant: sm (24px), md (40px), lg (64px)
 * @param text - Optional loading text displayed below spinner
 */
export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}
