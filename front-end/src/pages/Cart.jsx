import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  syncCartWithServer,
  selectCartItems,
  selectCartStatus,
  selectCartError,
  selectNeedsSyncing,
  removeFromCart,
  updateQuantity,
} from "../store/cartSlice";
import { AiOutlineDelete } from "react-icons/ai";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Checkout from "../components/Checkout";
import cartimage from "../Assets/image.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import LoadingSpinner from "../components/LoadingSpinner";

function CartContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartStatus = useSelector(selectCartStatus);
  const cartError = useSelector(selectCartError);
  const needsSync = useSelector(selectNeedsSyncing);
  const { user, token } = useSelector((state) => state.auth);

  // Initial cart fetch
  useEffect(() => {
    if (user && token && cartStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [user, token, cartStatus, dispatch]);

  // Sync cart when needed
  useEffect(() => {
    if (needsSync && user && token) {
      const syncTimer = setTimeout(() => {
        dispatch(syncCartWithServer())
          .unwrap()
          .catch((error) => {
            const errorMessage =
              error?.detail || error?.message || "Failed to sync cart";
            toast.error(errorMessage);
          });
      }, 1000);

      return () => clearTimeout(syncTimer);
    }
  }, [needsSync, user, token, dispatch]);

  const handleDeleteItem = async (product_id) => {
    if (!token) {
      toast.error("Please sign in to manage your cart");
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/cart/${product_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to remove item");
      }

      // Only dispatch removeFromCart if the server request was successful
      dispatch(removeFromCart(product_id));
      toast.success("Product removed from cart");
    } catch (error) {
      const errorMessage = error?.message || "Failed to remove item from cart";
      toast.error(errorMessage);
      // Refresh cart to ensure sync with server
      dispatch(fetchCart());
    }
  };

  const handleUpdateQuantity = async (product_id, quantity, size) => {
    if (!token) {
      toast.error("Please sign in to manage your cart");
      navigate("/signin");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/cart", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id, quantity, size }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update quantity");
      }

      dispatch(updateQuantity({ product_id, quantity }));
      toast.success("Cart updated successfully");
    } catch (error) {
      const errorMessage = error?.message || "Failed to update cart";
      toast.error(errorMessage);
      dispatch(fetchCart());
    }
  };

  if (cartStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-red-600">
            <p>
              {typeof cartError === "string"
                ? cartError
                : "An error occurred while loading your cart"}
            </p>
            <button
              onClick={() => dispatch(fetchCart())}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-black">Shopping Cart</h1>
          {needsSync && (
            <span className="text-sm text-gray-500">Syncing...</span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <img
              src={cartimage}
              alt="Empty cart"
              className="w-50 h-50 object-contain"
            />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <button
              onClick={() => navigate("/#collections")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cartItems.map((product) => (
                  <div key={product.product_id} className="relative group">
                    <div className="bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                      <ProductCard
                        product={product}
                        updateQuantity={handleUpdateQuantity}
                        className="w-full"
                        isCartItem={true}
                      />
                      <button
                        onClick={() => handleDeleteItem(product.product_id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:bg-gray-50"
                        title="Remove item"
                        type="button"
                        aria-label="Remove item from cart"
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
                <ErrorBoundary>
                  <Checkout />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Cart() {
  return (
    <ErrorBoundary>
      <CartContent />
    </ErrorBoundary>
  );
}

export default Cart;
