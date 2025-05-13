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
} from "../../store/cartSlice";
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Checkout from "../../components/Checkout";
import cartimage from "../../Assets/image.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundary";
import Footer from "../../components/Footer";

function CartContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartStatus = useSelector(selectCartStatus);
  const cartError = useSelector(selectCartError);
  const needsSync = useSelector(selectNeedsSyncing);
  const { user, token } = useSelector((state) => state.auth);

  console.log("Cart items from Redux:", cartItems);
  console.log("Cart items structure:", JSON.stringify(cartItems, null, 2));

  useEffect(() => {
    if (user && token && cartStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [user, token, cartStatus, dispatch]);

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

  useEffect(() => {
    const cleanupCart = async () => {
      if (cartItems.length > 0 && token) {
        const itemsNeedingUpdate = cartItems.filter(
          (item) => !item.name || !item.price || !item.image_url
        );

        if (itemsNeedingUpdate.length > 0) {
          console.log("Found items needing update:", itemsNeedingUpdate);
          // Trigger a cart refresh to get complete data
          dispatch(fetchCart());
        }
      }
    };

    cleanupCart();
  }, [cartItems, token, dispatch]);

  useEffect(() => {
    // Check for incomplete items and refresh cart
    const hasIncompleteItems = cartItems.some(
      (item) => !item.name || !item.price
    );

    if (hasIncompleteItems && token) {
      console.log("Found incomplete cart items, refreshing...");
      dispatch(fetchCart());
    }
  }, [cartItems, token, dispatch]);

  const handleQuantityChange = async (product_id, quantity, size) => {
    if (!token) {
      toast.error("Please sign in to manage your cart");
      navigate("/signin");
      return;
    }

    if (quantity < 1) {
      return handleDeleteItem(product_id);
    }

    try {
      const response = await fetch(
        `http://localhost:8000/cart/update-quantity?product_id=${product_id}&quantity=${quantity}&size=${
          size || ""
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update quantity");
      }

      // After successful update, fetch the complete cart to get updated data
      dispatch(fetchCart());
      toast.success("Cart updated successfully");
    } catch (error) {
      const errorMessage = error?.message || "Failed to update cart";
      toast.error(errorMessage);
      dispatch(fetchCart());
    }
  };

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

      dispatch(removeFromCart(product_id));
      toast.success("Product removed from cart");
    } catch (error) {
      const errorMessage = error?.message || "Failed to remove item from cart";
      toast.error(errorMessage);
      dispatch(fetchCart());
    }
  };

  const QuantityControl = ({ product }) => {
    if (!product || !product.product_id) return null;

    return (
      <div className="flex items-center justify-between bg-gray-100 rounded-full p-2 shadow-sm">
        <button
          onClick={() => {
            if (product.quantity === 1) {
              handleDeleteItem(product.product_id);
            } else {
              handleQuantityChange(
                product.product_id,
                product.quantity - 1,
                product.size
              );
            }
          }}
          className="p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
          aria-label={
            product.quantity === 1 ? "Remove item" : "Decrease quantity"
          }
        >
          {product.quantity === 1 ? (
            <Trash2 className="w-5 h-5 text-red-600" />
          ) : (
            <Minus className="w-5 h-5 text-gray-700" />
          )}
        </button>

        <span className="mx-4 font-medium text-gray-900 min-w-8 text-center">
          {product.quantity}
        </span>

        <button
          onClick={() =>
            handleQuantityChange(
              product.product_id,
              product.quantity + 1,
              product.size
            )
          }
          className="p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
          aria-label="Increase quantity"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    );
  };

  if (cartStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
            <p className="text-lg text-gray-700 font-medium">
              Loading your cart...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24">
          <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-200 shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <ShoppingBag className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-3">Oops!</h2>
            <p className="text-red-700 mb-6 max-w-md mx-auto">{cartError}</p>
            <button
              onClick={() => dispatch(fetchCart())}
              className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md hover:shadow-lg font-medium"
            >
              Try Again
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
                Your Cart
              </h1>
              <p className="text-gray-600 text-lg">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <button
              onClick={() => dispatch(fetchCart())}
              className="px-4 py-2 bg-black text-white rounded-full flex items-center gap-2 hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
              {needsSync && <Loader2 className="w-4 h-4 animate-spin ml-1" />}
            </button>
          </div>

          <div className="mt-6 h-1 w-32 bg-black rounded"></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <img
              src={cartimage}
              alt="Empty cart"
              className="w-56 h-56 object-contain mx-auto mb-8"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate("/#collections")}
              className="inline-flex items-center px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cartItems.map((product) => {
                  console.log("Rendering product:", product);

                  // Skip rendering if product is missing essential data
                  if (!product.name || !product.price) {
                    console.warn(
                      "Skipping product due to missing data:",
                      product
                    );
                    return null;
                  }

                  return (
                    <div key={product.product_id} className="relative group">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:shadow-md group-hover:border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/128/128";
                              }}
                            />
                          </div>
                          <div className="flex-grow text-center sm:text-left">
                            <h3 className="font-semibold text-xl text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Size:{" "}
                              <span className="font-medium">
                                {product.size}
                              </span>
                            </p>
                            <p className="text-gray-900 font-bold text-lg">
                              PKR {product.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0 mt-4 sm:mt-0">
                            <QuantityControl product={product} />
                            <button
                              onClick={() =>
                                handleDeleteItem(product.product_id)
                              }
                              className="mt-4 w-full text-sm text-gray-500 hover:text-red-600 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-start">
                <button
                  onClick={() => navigate("/#collections")}
                  className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ErrorBoundary>
                  <Checkout />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
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
