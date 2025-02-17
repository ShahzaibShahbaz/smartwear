import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import cartImage from "../Assets/wishlist.png";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const fetchWishlist = async () => {
    if (!token || !user) {
      setError("Please sign in to view your wishlist");
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.product_id !== productId)
      );
      toast.success("Item removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item from wishlist");
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
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
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
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">Oops!</h2>
            <p className="text-red-600 mb-4">{error}</p>
            {!token && (
              <button
                onClick={() => navigate("/signin")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign In
              </button>
            )}
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
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <img
              src={cartImage}
              alt="Empty wishlist"
              className="w-48 h-48 object-contain mx-auto mb-6"
            />

            <p className="text-gray-600 mb-8">
              Add items you love to your wishlist and revisit them later!
            </p>
            <button
              onClick={() => navigate("/#collections")}
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-2 text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => navigate("/#collections")}
            className="inline-flex items-center px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.product_id}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square">
                <img
                  src={item.name.image_url || "/placeholder-image.jpg"}
                  alt={item.name.name || "Product Image"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  disabled={deletingItems.has(item.product_id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm 
                           hover:bg-white hover:shadow-md transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove from wishlist"
                >
                  {deletingItems.has(item.product_id) ? (
                    <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-600" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {item.name.name || "Unnamed Product"}
                </h3>
                <p className="text-lg font-semibold text-gray-900 mb-3">
                  PKR {item.name.price?.toLocaleString() || "Price unavailable"}
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
                      toast.error("Error loading product details");
                    }
                  }}
                  className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                           transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
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
