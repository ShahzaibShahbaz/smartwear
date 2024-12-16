import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, token } = useSelector((state) => state.auth);
  console.log(wishlist);

  console.log(`useri ${user}, and token: ${token}`);

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure items are always an array
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
      await axios.delete(`http://localhost:8000/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.product_id !== productId)
      );
    } catch (error) {
      console.error("Error removing product:", error);
      setError(
        error.response?.data?.detail || "Failed to remove product from wishlist"
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-700 text-2xl font-bold">
            Loading wishlist...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-red-50">
          <p className="text-red-600 text-xl font-semibold">{error}</p>
        </div>
      </>
    );
  }

  if (wishlist.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-700 text-2xl font-bold">
            Your wishlist is empty.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">My Wishlist</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.product_id}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    Product ID: {item.product_id}
                  </h2>
                  <h2 className="text-lg font-semibold">
                    Product Name: {item.name.name}
                  </h2>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Wishlist;
