import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

const Buying = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const product = state?.product;
  const { user, token } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || product?.image_url || ""
  );
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const isItemInWishlist = data.items.some(
          (item) => item.product_id === product._id
        );
        setIsInWishlist(isItemInWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product._id, token]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warn("Please select a size before adding to cart!");
      return;
    }

    if (!token || !user) {
      toast.error("Please login to buy this product");
      setTimeout(() => {
        navigate("/signin", {
          state: {
            from: window.location.pathname,
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              image_url: product.image_url || product.images?.[0],
              description: product.description,
              size: product.size,
              gender: product.gender,
            },
          },
        });
      }, 2000);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: String(user.id),
          items: [
            {
              product_id: String(product._id),
              quantity: parseInt(quantity),
              size: selectedSize,
              name: product.name,
              price: product.price,
              image_url: product.image_url || product.images?.[0],
            },
          ],
        }),
      });

      if (response.ok) {
        dispatch(
          addToCart({
            product_id: String(product._id),
            name: product.name,
            price: product.price,
            image_url: product.image_url || product.images?.[0],
            quantity: parseInt(quantity),
            size: selectedSize,
          })
        );
        toast.success("Item added to cart successfully");
      } else {
        const error = await response.json();
        toast.error(`Failed to add to cart: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart.");
    }
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      toast.error("Please sign in to manage your wishlist");
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(
          `http://localhost:8000/wishlist/${product._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsInWishlist(false);
          toast.success("Product removed from wishlist!");
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const response = await fetch("http://localhost:8000/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product._id,
            image_url: product.image_url,
            price: product.price,
          }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success("Product added to wishlist!");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      toast.error(error.message || "An unknown error occurred.");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">
          Product not found. Please return to the product page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Image Gallery Section */}
        <div className="space-y-6">
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-center object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {product.images?.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`
                  relative aspect-square overflow-hidden rounded-lg
                  transition-all duration-200
                  ${
                    selectedImage === img
                      ? "ring-2 ring-black"
                      : "ring-1 ring-gray-200 hover:ring-gray-400"
                  }
                `}
              >
                <img
                  src={img}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-10 lg:mt-0 lg:pl-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">ID: {product._id}</p>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                PKR {product.price?.toLocaleString()}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <p>{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                {product.gender}'s Size
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {product.size?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${
                        selectedSize === size
                          ? "bg-black text-white ring-2 ring-black ring-offset-2"
                          : "bg-white text-gray-900 border border-gray-200 hover:border-gray-400"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                    className={`
                      p-2 rounded-lg border transition-all duration-200
                      ${
                        quantity > 1
                          ? "border-gray-300 hover:border-gray-400 text-gray-600"
                          : "border-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => quantity < 5 && setQuantity((q) => q + 1)}
                    className={`
                      p-2 rounded-lg border transition-all duration-200
                      ${
                        quantity < 5
                          ? "border-gray-300 hover:border-gray-400 text-gray-600"
                          : "border-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                    disabled={quantity >= 5}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Maximum 5 pieces per order
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-6">
              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist}
                className={`
                  p-4 rounded-full transition-all duration-200 relative
                  ${
                    isInWishlist
                      ? "bg-red-50 hover:bg-red-100"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                  ${isAddingToWishlist ? "cursor-not-allowed" : ""}
                `}
              >
                <Heart
                  className={`
                    w-6 h-6 transition-colors
                    ${
                      isInWishlist
                        ? "text-red-500 fill-red-500"
                        : "text-gray-900"
                    }
                    ${isAddingToWishlist ? "opacity-50" : ""}
                  `}
                />
                {isAddingToWishlist && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>

              <button
                onClick={handleAddToCart}
                className="
                  flex-1 bg-black text-white py-4 px-8 rounded-lg
                  hover:bg-gray-900 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                  disabled:bg-gray-400 disabled:cursor-not-allowed
                  flex items-center justify-center space-x-2
                "
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Buying;
