import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import CartItemImage from "./CartItemImage";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";

const ProductCard = ({ product, isCartItem, observer }) => {
  const navigate = useNavigate();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !token) return;

      try {
        const response = await axios.get("http://localhost:8000/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const isItemInWishlist = response.data.items.some(
          (item) => item.product_id === product._id
        );
        setIsInWishlist(isItemInWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product._id, isAuthenticated, token]);

  const getProductName = () => {
    if (typeof product.name === "string") return product.name;
    if (product.name && product.name.name) return product.name.name;
    return "Unnamed Product";
  };

  const getProductPrice = () => {
    if (typeof product.price === "number") return product.price;
    if (product.name && product.name.price) return product.name.price;
    return 0;
  };

  const handleCardClick = () => {
    if (!isCartItem) {
      navigate(`/product/${encodeURIComponent(getProductName())}`, {
        state: { product },
      });
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please sign in to manage your wishlist", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/signin", {
          state: { from: window.location.pathname },
        });
      }, 2000);
      return;
    }

    if (isAddingToWishlist) return;

    try {
      setIsAddingToWishlist(true);

      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`http://localhost:8000/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
        toast.success("Removed from wishlist successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        // Add to wishlist
        await axios.post(
          "http://localhost:8000/wishlist",
          {
            product_id: product._id,
            image_url: product.image_url,
            price: product.price,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsInWishlist(true);
        toast.success("Added to wishlist successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (
        error.response?.status === 400 &&
        error.response?.data?.detail?.includes("already in wishlist")
      ) {
        toast.info("Item is already in your wishlist", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to update wishlist",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="group relative">
      <div
        onClick={!isCartItem ? handleCardClick : undefined}
        className={`relative w-full bg-white rounded-lg overflow-hidden transition-all duration-300 ${
          !isCartItem ? "hover:shadow-md cursor-pointer" : "cursor-default"
        }`}
      >
        {!isCartItem && (
          <button
            className={`absolute z-10 top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:bg-white ${
                       isAddingToWishlist ? "cursor-not-allowed" : ""
                     }`}
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist}
          >
            {isAddingToWishlist ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isInWishlist
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            )}
          </button>
        )}

        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
          {isCartItem ? (
            <CartItemImage product={product} />
          ) : (
            <img
              ref={
                observer
                  ? (node) => {
                      if (node) observer.observe(node);
                    }
                  : null
              }
              data-src={product.image_url}
              alt={getProductName()}
              className="w-full h-full object-cover object-center transition-transform duration-300 
                       group-hover:scale-105"
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
              onError={(e) => {
                e.target.src = "/api/placeholder/400/400";
              }}
            />
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1 line-clamp-1">
            {getProductName()}
          </h3>
          <p className="text-sm font-semibold text-gray-900">
            PKR {getProductPrice()?.toLocaleString()}
          </p>
          {isCartItem && product.size && (
            <p className="text-xs text-gray-500 mt-1">Size: {product.size}</p>
          )}
          {isCartItem && (
            <p className="text-xs text-gray-500">
              Quantity: {product.quantity}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
