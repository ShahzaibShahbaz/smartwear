// VirtualTryOn.jsx
import React, { useState, useCallback } from "react";
import axios from "axios";

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop for person image
  const handlePersonDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file, "person");
    }
  }, []);

  // Handle drop for garment image
  const handleGarmentDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file, "garment");
    }
  }, []);

  // Handle file input change
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file, type);
    }
  };

  // Process and validate the image
  const processImage = (file, type) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError(`Please select an image file for the ${type}.`);
      return;
    }

    // Check file size (e.g., 25MB max)
    if (file.size > 25 * 1024 * 1024) {
      // Make sure you have your file size check
      setError(`${type} image exceeds maximum size of 25MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image(); // Create a new Image object
      img.onload = () => {
        // This function executes once the image source is loaded
        // CORRECT PLACE for dimension checks:
        // Now img.width and img.height have the actual dimensions of the loaded image.

        // IMPORTANT: Verify these values (256, 1920) against the
        // "Try On Diffusion" API's actual documentation for clothing images.
        // The error "Clothing image: image_too_small" came from the external API.
        const MIN_DIMENSION = 256; // Replace with actual minimum from API docs if different
        const MAX_DIMENSION = 1920; // Replace with actual maximum from API docs if different

        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          setError(
            `${type} image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels. Current: ${img.width}x${img.height}`
          );
          return;
        }
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          setError(
            `${type} image must be no larger than ${MAX_DIMENSION}x${MAX_DIMENSION} pixels. Current: ${img.width}x${img.height}`
          );
          return;
        }

        // All validations passed, set the image
        if (type === "person") {
          setPersonImage({
            file,
            preview: e.target.result, // This is the data URL for the preview
          });
        } else {
          setGarmentImage({
            file,
            preview: e.target.result, // This is the data URL for the preview
          });
        }
        setError(""); // Clear any previous errors
      };
      img.onerror = () => {
        // Handle cases where the image data is invalid
        setError(`Invalid image file for ${type}. Could not load image.`);
      };
      img.src = e.target.result; // Set the source of the Image object to the file's data URL
    };
    reader.onerror = () => {
      // Handle file reading errors
      setError(`Error reading file for ${type}.`);
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  };

  // Function to convert data URL to a Blob for proper URL creation

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // Create in Cloudinary settings
    formData.append("cloud_name", "dlkzoykwu");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dlkzoykwu/image/upload",
      formData
    );

    return response.data.secure_url;
  };
  // Submit the try-on request
  const handleSubmit = async () => {
    if (!personImage || !garmentImage) {
      setError("Please upload both a person and garment image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload both images to Cloudinary
      const personUrl = await uploadToCloudinary(personImage.file);
      const garmentUrl = await uploadToCloudinary(garmentImage.file);

      // Send the URLs to your backend
      const response = await fetch(
        "http://localhost:8000/virtual-tryon/try-on", // This matches your FastAPI setup
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person_image_url: personUrl, // Key name as expected by FastAPI TryOnURLRequest
            garment_image_url: garmentUrl, // Key name as expected by FastAPI TryOnURLRequest
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // FastAPI sends {'detail': 'error message'}
        throw new Error(errorData.detail || "Error processing try-on request."); // This is good
      }

      const data = await response.json(); // Expects {'result_url': '...'}
      setResultImage(data.result_url); // This is good
    } catch (err) {
      setError(`Try-on failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset all states
  const handleReset = () => {
    setPersonImage(null);
    setGarmentImage(null);
    setResultImage(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-3xl font-bold">Virtual Try-On</h1>
          <p className="mt-2">
            Upload a person and a garment to see how they look together
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Upload section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person Image Upload */}
            <div>
              <h2 className="text-lg font-medium mb-3">Person Image</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  personImage
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                } transition-colors`}
                onDragOver={handleDragOver}
                onDrop={handlePersonDrop}
              >
                {personImage ? (
                  <div className="relative">
                    <img
                      src={personImage.preview}
                      alt="Person preview"
                      className="w-full h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPersonImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your person image here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or</p>
                    <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "person")}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <ul className="list-disc pl-5">
                  <li>One person only</li>
                  <li>Plain background preferred</li>
                  <li>Person should face forward</li>
                  <li>3/4 body view works best</li>
                </ul>
              </div>
            </div>

            {/* Garment Image Upload */}
            <div>
              <h2 className="text-lg font-medium mb-3">Garment Image</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  garmentImage
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                } transition-colors`}
                onDragOver={handleDragOver}
                onDrop={handleGarmentDrop}
              >
                {garmentImage ? (
                  <div className="relative">
                    <img
                      src={garmentImage.preview}
                      alt="Garment preview"
                      className="w-full h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setGarmentImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your garment image here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or</p>
                    <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "garment")}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <ul className="list-disc pl-5">
                  <li>Single garment only</li>
                  <li>Stock photos work best</li>
                  <li>Garment should fill most of the frame</li>
                  <li>Works best with tops (shirts, blouses, etc.)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!personImage || !garmentImage || loading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                !personImage || !garmentImage || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Try On Garment"
              )}
            </button>
          </div>
        </div>

        {/* Result section */}
        {resultImage && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="relative">
                <img
                  src={resultImage}
                  alt="Try-on result"
                  className="mx-auto max-h-96 object-contain"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <a
                  href={resultImage}
                  download="virtual-tryon-result.jpg"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Result
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer with info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Virtual Try-On powered by PixelCut AI. Results are valid for 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
