import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  console.log("Current userId:", userId);


  const fetchWishlist = async () => {
    if (!userId) {
      console.error("User is not logged in");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`/wishlist?user_id=${userId}`);
      setWishlist(response.data.items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]); // Add userId as a dependency if it might change

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete("/wishlist/remove", {
        data: { user_id: userId, product_id: productId },
      });
      fetchWishlist(); // Refresh wishlist
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 text-2xl font-bold">Loading...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 text-2xl font-bold">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">My Wishlist</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">Product ID: {item.product_id}</h2>
                  <p className="text-gray-600 mt-2">
                    Added on: {item.added_at ? new Date(item.added_at).toLocaleDateString() : "Unknown"}
                  </p>
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
};

export default Wishlist;
