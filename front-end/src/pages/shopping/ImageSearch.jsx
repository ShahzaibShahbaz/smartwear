import React, { useState } from "react";
import { Camera, Upload, X, Search } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageSearchPage = () => {
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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Visual Search
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image to find similar products in our collection. We'll
            analyze your image and show you the closest matches.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-600" />
                </div>

                <div className="text-gray-600">
                  <p className="font-medium">Drag and drop your image here</p>
                  <p className="text-sm">or</p>
                </div>

                <label
                  className="inline-flex items-center px-4 py-2 border border-gray-300 
                                rounded-md shadow-sm text-sm font-medium text-gray-700 
                                bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md 
                         hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute bottom-4 right-4 px-4 py-2 bg-black text-white 
                         rounded-md shadow-md hover:bg-gray-800 transition-colors
                         disabled:bg-gray-400 disabled:cursor-not-allowed
                         flex items-center space-x-2"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Similar Products
            </h2>
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

                return (
                  <div key={product._id} className="relative">
                    <ProductCard
                      product={formattedProduct}
                      isCartItem={false}
                    />
                    {product.similarity_score && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
                        {(product.similarity_score * 100).toFixed(1)}% match
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ImageSearchPage;
