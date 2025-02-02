import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { AiOutlineHeart } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Buying() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  console.log(state);
  const product = state?.product;
  const { user, token } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || product?.image_url || ""
  );
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warn("Please select a size before adding to cart!");
      return;
    }

    if (!token || !user) {
      toast.error("Please login to buy this product");
      setTimeout(() => {
        navigate("/signin", {
          state: { from: window.location.pathname, product: state?.product },
        });
      }, 2000);
      return;
    }

    const cartItem = {
      user_id: String(user.id),
      items: [
        {
          product_id: String(product._id),
          quantity: parseInt(quantity),
          size: selectedSize,
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:8000/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItem),
      });

      if (response.ok) {
        dispatch(
          addToCart({
            product_id: String(
              product._id || product.name.replace(/\s+/g, "-").toLowerCase()
            ),
            name: product.name.trim(),
            price: product.price,
            image_url: product.image_url,
            quantity: parseInt(quantity, 10),
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

  const handleAddToWishlist = async () => {
    try {
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
      console.log("res", response);

      if (response.ok) {
        toast.success("Product added to wishlist!");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add to wishlist: ${errorData.detail}`);
      }
    } catch (error) {
      toast.error("An unknown error occurred.");
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-center object-cover"
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {product.images?.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square overflow-hidden rounded-md ${
                  selectedImage === img
                    ? "ring-2 ring-black"
                    : "ring-1 ring-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-center object-cover hover:opacity-75"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-medium text-gray-900">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500">ID: {product._id}</p>
            <p className="text-2xl font-medium text-gray-900">
              PKR {product.price?.toLocaleString()}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">
              {product.gender}'s Size
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {product.size?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    py-2 text-sm font-medium rounded-md
                    ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-medium w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => quantity < 5 && setQuantity((q) => q + 1)}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                +
              </button>
              <span className="text-sm text-gray-500">
                Maximum 5 pieces per order
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6">
            <button
              onClick={handleAddToWishlist}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <AiOutlineHeart className="w-6 h-6 text-gray-900" />
            </button>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-900 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-black"
            >
              Add to Cart
            </button>
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
}

export default Buying;
