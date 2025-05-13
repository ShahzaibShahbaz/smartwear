import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import cartImage from "../../Assets/wishlist.png";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";

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
          <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center">
            <Loader2 className="w-14 h-14 text-black animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading your wishlist...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24">
          <div className="text-center bg-red-50 p-10 rounded-2xl border border-red-200 shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-3">Oops!</h2>
            <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
            {!token && (
              <button
                onClick={() => navigate("/signin")}
                className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
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
        <div className="max-w-5xl mx-auto px-4 py-24">
          <div className="text-center bg-white rounded-2xl shadow-sm p-12 border border-gray-100">
            <img
              src={cartImage}
              alt="Empty wishlist"
              className="w-56 h-56 object-contain mx-auto mb-8"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add items you love to your wishlist and revisit them later!
            </p>
            <button
              onClick={() => navigate("/#collections")}
              className="inline-flex items-center px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                My Wishlist
              </h1>
              <p className="text-gray-600 text-lg">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}{" "}
                saved for later
              </p>
            </div>

            <button
              onClick={() => navigate("/#collections")}
              className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>

          <div className="mt-6 h-1 w-32 bg-black rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.product_id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.name.image_url || "/placeholder-image.jpg"}
                  alt={item.name.name || "Product Image"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  disabled={deletingItems.has(item.product_id)}
                  className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-md 
                           hover:bg-red-50 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove from wishlist"
                >
                  {deletingItems.has(item.product_id) ? (
                    <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-600" />
                  )}
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium line-clamp-1">
                    {item.name.name || "Unnamed Product"}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-1 text-lg">
                  {item.name.name || "Unnamed Product"}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-4">
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
                  className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 
                           transition-all duration-300 flex items-center justify-center font-medium shadow-sm hover:shadow group"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
