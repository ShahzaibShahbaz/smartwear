import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  X,
  Download,
  Camera,
  Trash2,
  RotateCw,
  CheckCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Main content with top margin to avoid navbar overlap */}
      <div className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Virtual Try-On
          </h1>

          {/* Error message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Card */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                  Selected Garment
                </h2>

                <div className="aspect-square w-full overflow-hidden rounded-lg mb-6">
                  <img
                    src={product?.image_url}
                    alt={product?.name || "Selected product"}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => (e.target.src = "/api/placeholder/400/400")}
                  />
                </div>

                <h3 className="text-lg font-medium text-gray-800">
                  {product?.name}
                </h3>
                <p className="text-xl font-medium text-gray-900 mt-2">
                  PKR {product?.price?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                  Your Photo
                </h2>

                <div
                  className={`border-2 border-dashed rounded-lg ${
                    personImage
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-300 hover:border-blue-400 bg-gray-50"
                  } transition-all duration-200 mb-4`}
                  onDragOver={handleDragOver}
                  onDrop={handlePersonDrop}
                >
                  {personImage ? (
                    <div className="relative p-4">
                      <img
                        src={personImage.preview}
                        alt="Person preview"
                        className="mx-auto max-h-80 object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setPersonImage(null)}
                        className="absolute top-6 right-6 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div className="mt-4 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                          Image uploaded successfully
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-base text-gray-600 mb-2">
                        Drag and drop your photo here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                        <Camera className="h-4 w-4 mr-2" />
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

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 text-sm">
                    Tips for best results:
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Plain background preferred</li>
                    <li>Face forward, standing position</li>
                    <li>3/4 body view works best</li>
                    <li>Avoid loose/baggy clothing</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!personImage}
                    className={`inline-flex items-center px-4 py-2 rounded-lg ${
                      !personImage
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!personImage || loading}
                    className={`inline-flex items-center px-6 py-2.5 rounded-lg shadow-sm ${
                      !personImage || loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition-colors`}
                  >
                    {loading ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Try On Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Result section */}
          {resultImage && (
            <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 py-3 px-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Try-On Result
                </h2>
              </div>

              <div className="p-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-center">
                    <img
                      src={resultImage}
                      alt="Try-on result"
                      className="max-h-96 object-contain rounded-lg"
                    />
                  </div>

                  <div className="mt-6 flex justify-center">
                    <a
                      href={resultImage}
                      download="virtual-tryon-result.jpg"
                      className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Result
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VirtualTryOn;
