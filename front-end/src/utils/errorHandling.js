// Error types for consistent error handling
export const ErrorTypes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  CART_ERROR: "CART_ERROR",
};

// User-friendly error messages
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]:
    "Unable to connect to the server. Please check your internet connection.",
  [ErrorTypes.AUTH_ERROR]: "Your session has expired. Please sign in again.",
  [ErrorTypes.NOT_FOUND]: "The requested resource was not found.",
  [ErrorTypes.VALIDATION_ERROR]: "Please check your input and try again.",
  [ErrorTypes.SERVER_ERROR]:
    "An unexpected error occurred. Please try again later.",
  [ErrorTypes.CART_ERROR]:
    "There was an issue with your cart. Please try again.",
};

// Error handler function
export const handleApiError = (error) => {
  console.error("API Error:", error); // Keep logging for debugging

  if (!error.response) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      message: ErrorMessages[ErrorTypes.NETWORK_ERROR],
    };
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      return {
        type: ErrorTypes.VALIDATION_ERROR,
        message:
          error.response.data?.detail ||
          ErrorMessages[ErrorTypes.VALIDATION_ERROR],
      };
    case 401:
    case 403:
      return {
        type: ErrorTypes.AUTH_ERROR,
        message: ErrorMessages[ErrorTypes.AUTH_ERROR],
      };
    case 404:
      return {
        type: ErrorTypes.NOT_FOUND,
        message: ErrorMessages[ErrorTypes.NOT_FOUND],
      };
    case 500:
    default:
      return {
        type: ErrorTypes.SERVER_ERROR,
        message: ErrorMessages[ErrorTypes.SERVER_ERROR],
      };
  }
};

// Custom error boundary component
export class CustomError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}
