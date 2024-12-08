import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../api/axiosConfig";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Checkout from "../components/Checkout";
import axios from "axios";
import {
  setCartItems,
  updateQuantity,
  removeFromCart,
} from "../store/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Current cart items (in redux):", products);
  }, [products]);

  // Fetch cart data from backend if necessary (only when user is logged in)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        console.log("Fetching cart for user:", user);
        const response = await axiosInstance.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched cart items:", response.data.items);
        dispatch(setCartItems(response.data.items));
      } catch (error) {
        console.error("Error fetching cart:", error.response?.data || error);
      }
    };

    if (user && token && products.length === 0) {
      fetchCart();
    }
  }, [user, token, dispatch, products.length]);

  // Function to delete an item from the cart
  const handleDeleteItem = async (productId) => {
    try {
      await axios.delete(`/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(removeFromCart(productId));
    } catch (error) {
      console.error(
        "Error deleting item from cart:",
        error.response?.data || error
      );
    }
  };

  const handleUpdateQuantity = async (productId, quantity, size) => {
    try {
      await axiosInstance.put(
        "/cart",
        { product_id: productId, quantity, size },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateQuantity({ product_id: productId, quantity }));
    } catch (error) {
      console.error("Error updating cart:", error.response?.data || error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen mt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10">My Cart</h1>
        {products.length === 0 ? (
          <div className="text-center text-xl text-gray-600">
            Your cart is empty
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow">
              {products.map((product) => (
                <div key={product.product_id} className="relative">
                  <ProductCard
                    product={product}
                    updateQuantity={handleUpdateQuantity}
                  />
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteItem(product.product_id)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full"
                  >
                    delete kro ,ujhe
                  </button>
                </div>
              ))}
            </div>
            <div className="w-full md:w-96">
              <Checkout />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
