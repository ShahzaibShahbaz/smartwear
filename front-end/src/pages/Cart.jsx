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
import { AiOutlineDelete } from "react-icons/ai";

function Cart() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  console.log(user);

  // Fetch cart data from backend if necessary (only when user is logged in)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  const handleDeleteItem = async (product_id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/cart/${product_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(removeFromCart(product_id));
    } catch (error) {
      console.error(
        "Error deleting item from cart:",
        error.response?.data || error
      );
    }
  };

  const handleUpdateQuantity = async (product_id, quantity, size) => {
    try {
      await axiosInstance.put(
        "/cart",
        { product_id: product_id, quantity, size },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateQuantity({ product_id: product_id, quantity }));
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
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.product_id} className="relative">
                  <ProductCard
                    product={product}
                    updateQuantity={handleUpdateQuantity}
                    className="max-w-[250px] mx-auto" // Limit max width
                  />
                  <button
                    onClick={() => handleDeleteItem(product.product_id)}
                    className="absolute top-2 right-2 bg-black-500 hover:bg-black-500 text-black p-1 rounded-full transition-transform transform hover:scale-125"
                    title="Delete this item" // Helper text shown when hovering
                  >
                    <AiOutlineDelete className="text-3xl" />
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
