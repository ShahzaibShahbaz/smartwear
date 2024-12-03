import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductGrid = ({ searchTerm = "", filters = {} }) => {
  const [products, setProducts] = useState([]);

  // Fetch products including image URL from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products and images concurrently
        const [productsResponse] = await Promise.all([
          axios.get("http://localhost:8000/products/products"),
        ]);

        // Map images to products
        const productsWithImages = productsResponse.data.products.map(
          (product) => ({
            ...product,
            // Fallback to a default image if no image found for the category
            image_url: product.image_url || "https://via.placeholder.com/150",
          })
        );

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Set a default image or handle error state
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  console.log("eheheh", products);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
