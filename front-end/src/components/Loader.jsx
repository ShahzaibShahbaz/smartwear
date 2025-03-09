import React from "react";
import { LoaderCircle } from "lucide-react";

const Loader = ({ text = "Loading...", size = "default" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-50"
      role="alert"
      aria-busy="true"
      aria-label={text}
    >
      <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/50 shadow-lg">
        <LoaderCircle
          className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        />
        <p className="text-sm font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
