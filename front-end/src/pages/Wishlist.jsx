import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Trash2Icon } from "lucide-react";
import cartImage from "../Assets/wishlist.png";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

const LoaderIcon = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const fetchWishlist = async () => {
    if (!token || !user) {
      setError("User is not logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:8000/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(
        Array.isArray(response.data.items) ? response.data.items : []
      );
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError(
        error.response?.data?.detail ||
          error.message ||
          "Failed to fetch wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(productId));
      await axios.delete(`http://localhost:8000/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Artificial delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.product_id !== productId)
      );
    } catch (error) {
      console.error("Error removing product:", error);
      setError(
        error.response?.data?.detail || "Failed to remove product from wishlist"
      );
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="text-blue-600">
            <LoaderIcon />
          </div>
          <p className="mt-4 text-lg text-gray-600">Loading your wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-28">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <img
            src={cartImage}
            alt="Empty cart"
            className="w-50 h-50 object-contain"
          />

          <button
            onClick={() => navigate("/#collections")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Start Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-black">My Wishlist</h1>
          <p className="text-sm text-gray-600">{wishlist.length} items</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((item, index) => (
            <div
              key={item.product_id || index}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative">
                <img
                  src={item.name.image_url || "/placeholder-image.jpg"}
                  alt={item.name.name || "Product Name"}
                  className="w-full aspect-square object-cover group-hover:opacity-95 transition-opacity"
                />
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  disabled={deletingItems.has(item.product_id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-red-600 hover:text-red-700 hover:scale-110 disabled:opacity-75 disabled:hover:scale-100"
                >
                  {deletingItems.has(item.product_id) ? (
                    <LoaderIcon />
                  ) : (
                    <Trash2Icon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                  {item.name.name || "Unnamed Product"}
                </h2>
                <p className="text-lg font-semibold text-black">
                  PKR {item.name.price || "Price Unavailable"}
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `http://localhost:8000/products/${item.product_id}`
                      );
                      const productData = await response.json();
                      navigate(`/product/${item.product_id}`, {
                        state: {
                          product: {
                            _id: item.product_id,
                            name: item.name.name,
                            price: item.name.price,
                            image_url: item.name.image_url,
                            description: productData.description,
                            size: productData.size,
                            gender: productData.gender,
                            images: productData.images || [item.name.image_url],
                          },
                        },
                      });
                    } catch (error) {
                      toast.error("Error fetching product details:", error);
                      toast.error("Error loading product details");
                    }
                  }}
                  className="mt-2 w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Wishlist;
