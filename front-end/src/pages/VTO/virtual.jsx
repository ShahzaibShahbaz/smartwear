import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, X, Download } from "lucide-react";

const VirtualTryOn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [personImage, setPersonImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get product from location state
  const product = location.state?.product;

  useEffect(() => {
    // If no product is provided, redirect back to home
    if (!product) {
      navigate("/");
    }
  }, [product, navigate]);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop for person image
  const handlePersonDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  // Process and validate the image
  const processImage = (file) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Check file size (e.g., 25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setError("Image exceeds maximum size of 25MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Now img.width and img.height have the actual dimensions of the loaded image.
        const MIN_DIMENSION = 256;
        const MAX_DIMENSION = 1920;

        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          setError(
            `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels. Current: ${img.width}x${img.height}`
          );
          return;
        }
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          setError(
            `Image must be no larger than ${MAX_DIMENSION}x${MAX_DIMENSION} pixels. Current: ${img.width}x${img.height}`
          );
          return;
        }

        // All validations passed, set the image
        setPersonImage({
          file,
          preview: e.target.result,
        });
        setError("");
      };
      img.onerror = () => {
        setError("Invalid image file. Could not load image.");
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");
    formData.append("cloud_name", "dlkzoykwu");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dlkzoykwu/image/upload",
      formData
    );

    return response.data.secure_url;
  };

  // Submit the try-on request using product ID
  const handleSubmit = async () => {
    if (!personImage || !product) {
      setError("Please upload your photo to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload person image to Cloudinary
      const personUrl = await uploadToCloudinary(personImage.file);

      // Send the request to the backend
      const response = await fetch(
        "http://localhost:8000/virtual-tryon/try-on-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person_image_url: personUrl,
            product_id: product._id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error processing try-on request.");
      }

      const data = await response.json();
      setResultImage(data.result_url);
    } catch (err) {
      setError(`Try-on failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset all states
  const handleReset = () => {
    setPersonImage(null);
    setResultImage(null);
    setError("");
  };

  // Go back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            Virtual Try-On
          </h1>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Error message */}
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Preview Section */}
              <div>
                <h2 className="text-lg font-medium mb-4">Selected Garment</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="aspect-square w-full overflow-hidden rounded-lg mb-4">
                    <img
                      src={product?.image_url}
                      alt={product?.name || "Selected product"}
                      className="w-full h-full object-cover object-center"
                      onError={(e) =>
                        (e.target.src = "/api/placeholder/400/400")
                      }
                    />
                  </div>
                  <h3 className="text-lg font-medium">{product?.name}</h3>
                  <p className="text-gray-600 mt-1">
                    PKR {product?.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Person Image Upload */}
              <div>
                <h2 className="text-lg font-medium mb-4">Your Photo</h2>
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
                        className="w-full h-80 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setPersonImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-5 w-5" />
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
                        Drag and drop your photo here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">or</p>
                      <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <ul className="list-disc pl-5">
                    <li>Plain background preferred</li>
                    <li>Face forward, standing position</li>
                    <li>3/4 body view works best</li>
                    <li>Avoid loose/baggy clothing for best results</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
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
                    disabled={!personImage || loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      !personImage || loading
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
                      "Try On Now"
                    )}
                  </button>
                </div>
              </div>
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
                    <Download className="mr-2 h-5 w-5" />
                    Download Result
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Footer with info */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Virtual Try-On powered by SMART Wear. Results are valid for 1
              hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
