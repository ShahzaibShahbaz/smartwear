import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ScanFace } from "lucide-react";
import CartItemImage from "./CartItemImage";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader } from "lucide-react";

const ProductCard = ({ product, isCartItem, observer }) => {
  const navigate = useNavigate();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleTryOn = (e) => {
    e.stopPropagation();
    navigate(`/VTO`, {
      state: { product },
    });
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
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={
          !isCartItem
            ? () =>
                navigate(`/product/${encodeURIComponent(getProductName())}`, {
                  state: { product },
                })
            : undefined
        }
        className={`
          relative w-full bg-white rounded-xl overflow-hidden 
          transition-all duration-300 transform
          ${
            !isCartItem
              ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              : "cursor-default"
          }
          ${isHovered ? "scale-[1.02]" : "scale-100"}
        `}
      >
        {!isCartItem && (
          <>
            <button
              className={`
                absolute z-10 top-4 right-4 p-2.5
                bg-white/90 backdrop-blur-sm rounded-full
                shadow-sm transition-all duration-300
                ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }
                hover:bg-white hover:scale-110
                ${isAddingToWishlist ? "cursor-not-allowed" : ""}
              `}
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
            >
              {isAddingToWishlist ? (
                <Loader className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <Heart
                  className={`w-5 h-5 transition-colors
                    ${
                      isInWishlist
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }
                  `}
                />
              )}
            </button>

            {/* Try-On Button */}
            <button
              className={`
                absolute z-10 top-4 left-4 p-2.5
                bg-white/90 backdrop-blur-sm rounded-full
                shadow-sm transition-all duration-300
                ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }
                hover:bg-white hover:scale-110
              `}
              onClick={handleTryOn}
              title="Virtual Try-On"
            >
              <ScanFace className="w-5 h-5 text-blue-600" />
            </button>
          </>
        )}

        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50">
          {isCartItem ? (
            <CartItemImage product={product} />
          ) : (
            <img
              ref={observer ? (node) => node && observer.observe(node) : null}
              data-src={product.image_url}
              alt={getProductName()}
              className={`
                w-full h-full object-cover object-center
                transition-transform duration-500
                ${isHovered ? "scale-110" : "scale-100"}
              `}
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
              onError={(e) => (e.target.src = "/api/placeholder/400/400")}
            />
          )}
        </div>

        <div className="p-5">
          <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-1">
            {getProductName()}
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            PKR {getProductPrice()?.toLocaleString()}
          </p>
          {isCartItem && (
            <div className="mt-2 space-y-1">
              {product.size && (
                <p className="text-sm text-gray-500">Size: {product.size}</p>
              )}
              <p className="text-sm text-gray-500">
                Quantity: {product.quantity}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
