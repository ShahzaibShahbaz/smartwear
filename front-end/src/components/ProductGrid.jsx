import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductGrid = ({ searchTerm = "", filters = {}, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/products?gender=${category}`
      );

      const productsWithImages = response.data.products.map((product) => ({
        ...product,

        name: product.name
          .replace(/ - (Men|Women|Girls|Boys)\s*-\s*$/i, "") // Remove gender and trailing " - "
          .replace(/\s*\d+\s*$/, "") // Remove trailing numbers
          .replace(/\s*-\s*$/g, "") // Remove any trailing " - "
          .replace(/\s*-\s*(?=\S)/g, " "),

        image_url: product.image_url || "https://via.placeholder.com/150",
      }));

      setProducts(productsWithImages);

      setError(null);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, fetchProducts]);

  const filterProducts = useCallback(() => {
    return products
      .filter((product) => {
        // Search term filter
        if (
          searchTerm &&
          !product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        console.log("filter sizes", filters.sizes);
        console.log("product sizes", product.size);

        // Price range filter
        if (
          filters.priceRange &&
          (product.price < filters.priceRange[0] ||
            product.price > filters.priceRange[1])
        ) {
          return false;
        }

        // Size filter
        if (filters.sizes?.length > 0) {
          if (!product.size || !Array.isArray(product.size)) return false;
          const hasMatchingSize = filters.sizes.every((selectedSize) =>
            product.size.includes(selectedSize)
          );
          if (!hasMatchingSize) return false;
        }

        // Discount filter
        if (
          filters.discounts?.length > 0 &&
          !filters.discounts.includes(product.discount)
        ) {
          return false;
        }

        // Express filter
        if (filters.express && !product.express_delivery) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting logic
        if (filters.sort === "price_asc") {
          return a.price - b.price;
        }
        if (filters.sort === "price_desc") {
          return b.price - a.price;
        }
        return 0; // No sorting applied
      });
  }, [products, searchTerm, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredProducts = filterProducts();

  return (
    <div>
      <h1 className="text-xl font-bold">{category}</h1>
      <div className="mb-4 text-gray-600">
        Found {filteredProducts.length} products
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {filteredProducts.map((product) => (
          <>
            <ProductCard
              key={product._id}
              product={product}
              isCartItem={false}
            />
          </>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No products found matching your criteria
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
