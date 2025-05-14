import { FallbackProps } from 'react-error-boundary'
import Button from './ui/Button'
import { RefreshCw } from 'lucide-react'

const ErrorPage = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center">Application Error</h2>
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded border border-red-200 dark:border-red-800">
          <p className="text-sm font-mono text-red-800 dark:text-red-300 overflow-auto max-h-32">
            {error.message || 'An unknown error occurred'}
          </p>
        </div>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 text-center">
          The application has encountered an unexpected error. You can try refreshing the page or
          contact support if the problem persists.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={resetErrorBoundary}
            variant="primary"
            leftIcon={<RefreshCw size={16} />}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage