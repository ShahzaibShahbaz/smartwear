import React, { useState } from "react";

function ProductDetails({ product }) {
    const [selectedImage, setImage] = useState(product.images[0]);
    const [selectedSize, setSize] = useState(null);

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
                <p className="text-xl md:text-2xl text-gray-700 mb-4">${product.price}</p>
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

                {/* Add to Cart Button */}
                <button className="w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

export default ProductDetails;
