import { ErrorComponent, useRouter } from '@tanstack/react-router';
import { AppError } from '../lib/errors';

export function DefaultCatchBoundary({ error }: { error: unknown }) {
  const router = useRouter();

  if (error instanceof AppError) {
    return (
      <div className="p-6 max-w-md mx-auto mt-12 bg-red-50 border-l-4 border-red-500 rounded-md">
        <h3 className="text-lg font-bold text-red-800">Action Failed</h3>
        <p className="mt-2 text-sm text-red-700">
          {error.message}
        </p>
        <button 
          onClick={() => router.invalidate()}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-12 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-lg font-bold text-gray-900">Unexpected Application Error</h3>
      <p className="mt-2 text-sm text-gray-600">
        A system error occurred. Please try refreshing the page.
      </p>
      <ErrorComponent error={error} />
    </div>
  );
}