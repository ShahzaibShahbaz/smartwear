import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import {
  AiOutlineHeart,
} from "react-icons/ai";

function ProductDetails({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setImage] = useState(product.images[0]);
  const [selectedSize, setSize] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false); // New state for the popup

  const handleAddToCart = () => {
    if (!user) {
      alert("Please log in to add items to cart");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    dispatch(
      addToCart({
        product_id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: selectedImage,
        quantity: 1,
        size: selectedSize,
      })
    );

    // Show the success popup and hide it after 2 seconds
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row p-8 gap-10 justify-center">
      {/* Main Image Section */}
      <div className="flex-shrink-0 flex flex-col items-center lg:items-start">
        <img
          src={selectedImage}
          alt={product.name}
          className="w-80 md:w-96 rounded-lg shadow-lg"
        />
      </div>

      {/* Thumbnails Section */}
      <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
        {product.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setImage(img)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-lg cursor-pointer border ${
              selectedImage === img ? "border-black" : "border-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Product Details Section */}
      <div className="max-w-lg flex flex-col">
        {/* Product Name and Price */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>
          <button className="text-gray-500 hover:text-red-500 text-xl md:text-2xl">
            ❤️
          </button>
        </div>
        <p className="text-xl md:text-2xl text-gray-700 mb-4">
          ${product.price}
        </p>
        <p className="text-gray-600 mb-6">{product.description}</p>

        {/* Size Options */}
        <div className="mb-6">
          <p className="text-gray-700 font-semibold">Size</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {product.sizes.map((size, index) => (
              <button
                key={index}
                onClick={() => setSize(size)}
                className={`px-3 py-1 md:px-4 md:py-2 border rounded-md ${
                  selectedSize === size
                    ? "bg-gray-200 border-black"
                    : "border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex gap-4 items-center">
          {/* Wishlist (Heart) Button */}
          <button
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            onClick={() => {
              if (!user) {
                alert("Please log in to add items to your wishlist");
                return;
              }
              // Call your wishlist API here
              alert("Added to wishlist!");
            }}
          >
            <AiOutlineHeart className="text-xl text-red-500" />{" "}
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800"
            style={{ flex: 1 }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Success Popup */}
      {isPopupVisible && (
        <div className="fixed bottom-10 right-10 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg">
          Item successfully added to cart!
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
