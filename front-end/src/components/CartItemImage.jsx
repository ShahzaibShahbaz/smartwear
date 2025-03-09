import React from "react";

const CartItemImage = ({ product }) => {
  // Handle different image URL locations
  const getImageUrl = () => {
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) return product.images[0];
    if (typeof product.name === "object" && product.name.image_url)
      return product.name.image_url;

    // Return a placeholder if no image is found
    return "/api/placeholder/400/400";
  };

  return (
    <div className="w-full h-full aspect-square rounded-lg overflow-hidden">
      <img
        src={getImageUrl()}
        alt={typeof product.name === "string" ? product.name : "Product"}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = "/api/placeholder/400/400";
        }}
      />
    </div>
  );
};

export default CartItemImage;
