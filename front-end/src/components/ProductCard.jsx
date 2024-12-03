import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState(null);

  const imageUrl = product.image_url || "https://via.placeholder.com/150";

  const handleCardClick = () => {
    // Navigate to the Buying page and pass the product as state
    navigate("/product", { state: { product } });
  };

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150";
        }}
      />
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-gray-600 font-bold">${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
