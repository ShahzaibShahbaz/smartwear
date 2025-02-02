import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const ProductCard = ({ product, isCartItem }) => {
  const navigate = useNavigate();
  const image_url = product.image_url || "https://via.placeholder.com/150";

  const handleCardClick = () => {
    if (!isCartItem) {
      navigate(`/product/${product.name.replace(/\s+/g, "")}`, {
        state: { product },
      });
    }
  };

  return (
    <div className="group relative">
      <div
        onClick={!isCartItem ? handleCardClick : undefined} // Disable click when isCartItem is true
        className={`relative w-full bg-white rounded-lg overflow-hidden transition-all duration-300 ${
          !isCartItem ? "hover:shadow-md cursor-pointer" : "cursor-default"
        }`}
      >
        {/* Only show heart button if it's not a cart item */}
        {!isCartItem && (
          <button
            className="absolute z-10 top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        )}

        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <img
            src={image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 
                       group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-gray-900">
            PKR {product.price?.toLocaleString()}
          </p>
          {isCartItem && product.size && (
            <p className="text-xs text-gray-500 mt-1">Size: {product.size}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
