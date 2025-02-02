import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  setCartItems,
  updateQuantity,
  removeFromCart,
} from "../store/cartSlice";
import { AiOutlineDelete } from "react-icons/ai";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Checkout from "../components/Checkout";
import cartimage from "../Assets/image.png";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Cart() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleDeleteItem = async (product_id) => {
    try {
      await axios.delete(`http://localhost:8000/cart/${product_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(removeFromCart(product_id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error(`Error deleting item from cart: ${error}`);
    }
  };

  const handleUpdateQuantity = async (product_id, quantity, size) => {
    try {
      await axios.put(
        "/cart",
        { product_id, quantity, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateQuantity({ product_id, quantity }));
    } catch (error) {
      console.error("Error updating cart:", error.response?.data || error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-semibold text-black mb-4">
          Shopping Cart
        </h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <img
              src={cartimage}
              alt="Empty cart"
              className="w-50 h-50 object-contain"
            />
            <button
              onClick={() => navigate("/collections")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product.product_id} className="relative group">
                    <div className="bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                      <ProductCard
                        product={product}
                        updateQuantity={handleUpdateQuantity}
                        className="w-full"
                        isCartItem={true}
                        key={product.product_id}
                      />
                      <button
                        onClick={() => handleDeleteItem(product.product_id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:bg-gray-50"
                        title="Remove item"
                      >
                        <AiOutlineDelete className="text-black text-2xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Checkout />
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Cart;
