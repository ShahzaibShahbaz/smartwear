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

  console.log("cccc", cartItems);

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

      dispatch(updateQuantity({ product_id, quantity }));
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
    return (
      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
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
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          aria-label={
            product.quantity === 1 ? "Remove item" : "Decrease quantity"
          }
        >
          {product.quantity === 1 ? (
            <Trash2 className="w-5 h-5 text-red-600" />
          ) : (
            <Minus className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <span className="mx-4 font-medium text-gray-900">
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
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  if (cartStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
          <p className="text-lg text-gray-600">Loading your cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <ShoppingBag className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">Oops!</h2>
            <p className="text-red-600 mb-4">{cartError}</p>
            <button
              onClick={() => dispatch(fetchCart())}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-2 text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {needsSync && (
              <span className="text-sm text-black-600 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              </span>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <img
              src={cartimage}
              alt="Empty cart"
              className="w-48 h-48 object-contain mx-auto mb-6"
            />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate("/#collections")}
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {cartItems.map((product) => (
                  <div key={product.product_id} className="relative">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Size: {product.size}
                          </p>
                          <p className="text-gray-900 font-medium mt-1">
                            PKR {product.price}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <QuantityControl product={product} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
