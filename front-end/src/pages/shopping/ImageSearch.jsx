import React, { useState } from "react";
import {
  Camera,
  Upload,
  X,
  Search,
  FileImage,
  ExternalLink,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageSearchPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageSelect(file);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(
        "http://localhost:8000/image-search/search",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Search failed");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for similar products");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative mb-16 bg-gradient-to-r from-gray-900 to-black rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative py-16 px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3">
              Visual Search
            </h1>
            <div className="w-24 h-1 bg-gray-400 mx-auto mb-6"></div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Find the perfect match for any clothing item by uploading an
              image. Our AI will find similar styles in our collection.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 mx-auto mb-4">
                <FileImage className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload an Image</h3>
              <p className="text-gray-600">
                Drop or select an image of clothing you like
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Search</h3>
              <p className="text-gray-600">
                Our AI analyzes the image to find similar styles
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 mx-auto mb-4">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Results</h3>
              <p className="text-gray-600">
                Browse through matching items and find your perfect style
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Upload Your Image
          </h2>
          <div className="max-w-2xl mx-auto">
            {!selectedImage ? (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                  ${
                    isDragging
                      ? "border-black bg-gray-100 scale-[1.02] shadow-md"
                      : "border-gray-300"
                  }
                  hover:border-gray-400 hover:bg-gray-50`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-gray-500" />
                  </div>

                  <div className="text-gray-600">
                    <p className="text-lg font-medium">
                      Drag and drop your image here
                    </p>
                    <p className="text-gray-500 mt-2">
                      Upload a clear image of the clothing item you want to find
                    </p>
                  </div>

                  <div className="pt-4">
                    <label
                      className="inline-flex items-center px-6 py-3 border border-gray-300 
                                  rounded-lg shadow-sm text-base font-medium text-gray-700 
                                  bg-white hover:bg-gray-50 hover:text-black hover:border-black
                                  transition-all duration-200 cursor-pointer"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                      />
                    </label>
                  </div>

                  <div className="pt-4 text-sm text-gray-500">
                    <p>For best results:</p>
                    <ul className="flex flex-wrap justify-center gap-x-6 mt-2">
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span>
                        Clear background
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span>
                        Good lighting
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span>
                        Solo item view
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="absolute top-0 right-0 p-4 flex space-x-2">
                  <button
                    onClick={handleClearImage}
                    className="p-2 bg-white rounded-full shadow-md 
                              hover:bg-gray-100 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-6">
                    Ready to find similar items in our collection?
                  </p>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="inline-flex items-center justify-center px-8 py-3 bg-black text-white 
                              rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200
                              disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    {isSearching ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        <span>Find Similar Items</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 h-64 bg-gradient-to-b from-gray-100 to-transparent -z-10"></div>
            <div className="relative pt-16 pb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                We Found {searchResults.length} Similar Items
              </h2>
              <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Browse through these matches to find your perfect style. Items
                are ranked by similarity score.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => {
                  // Format product data to match what ProductCard expects
                  const formattedProduct = {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    images: product.images,
                    description: product.description,
                    gender: product.gender,
                    size: product.size,
                    similarity_score: product.similarity_score,
                  };

                  // Custom product card rendering since ProductCard isn't displaying images properly
                  return (
                    <div
                      key={product._id}
                      className="relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
                    >
                      {/* Match percentage badge */}
                      {product.similarity_score && (
                        <div className="absolute top-2 left-2 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                          {(product.similarity_score * 100).toFixed(1)}% match
                        </div>
                      )}

                      {/* Product image */}
                      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50">
                        <img
                          src={
                            product.image_url ||
                            (product.images && product.images[0])
                          }
                          alt={product.name || "Product"}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = "/api/placeholder/400/400";
                          }}
                        />
                      </div>

                      {/* Product info */}
                      <div className="p-5">
                        <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-1">
                          {product.name || "Product"}
                        </h3>
                        <p className="text-lg font-semibold text-gray-900">
                          PKR {product.price?.toLocaleString() || "0"}
                        </p>

                        {/* View details button */}
                        <button
                          onClick={() => {
                            navigate(
                              `/product/${encodeURIComponent(product.name)}`,
                              {
                                state: { product: formattedProduct },
                              }
                            );
                          }}
                          className="w-full mt-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ImageSearchPage;
