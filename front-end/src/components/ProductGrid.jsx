import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

function capitalizeFirstLetter(str) {
  return str
    .split(" ") // Split the string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the words back together
}
const ProductGrid = ({ searchTerm = "", filters = {}, category }) => {
  const [products, setProducts] = useState([]);
  category = capitalizeFirstLetter(category);
  // Fetch products including image URL from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products and images concurrently
        console.log("Category: ", category);

        console.log("Making request for category:", category);
        const productsResponse = await axios.get(
          `http://localhost:8000/products?gender=${category}`
        );
        console.log("API Response:", productsResponse);

        // Map images to products
        const productsWithImages = productsResponse.data.products.map(
          (product) => ({
            ...product,
            // Fallback to a default image if no image found for the category
            image_url: product.image_url || "https://via.placeholder.com/150",
          })
        );
        console.log("hehe", productsWithImages);

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Set a default image or handle error state
        setProducts([]);
      }
    };

    if (category) {
      fetchProducts(); // Only fetch products if category is defined
    }
  }, [category]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
