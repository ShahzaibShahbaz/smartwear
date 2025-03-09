import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (event) => {
      setHasError(true);
      setError(event.reason);
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
