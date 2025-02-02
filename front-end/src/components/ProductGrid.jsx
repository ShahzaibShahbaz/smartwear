import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const ProductGrid = ({ searchTerm = "", filters = {}, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    has_next: false,
    has_previous: false,
  });
  const [observer, setObserver] = useState(null);

  // Initialize Intersection Observer for lazy loading
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    }, options);

    setObserver(observer);

    return () => observer.disconnect();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/products`, {
        params: {
          gender: category,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...filters,
        },
      });

      const productsWithImages = response.data.products.map((product) => ({
        ...product,
        name: product.name
          .replace(/ - (Men|Women|Girls|Boys)\s*-\s*$/i, "")
          .replace(/\s*\d+\s*$/, "")
          .replace(/\s*-\s*$/g, "")
          .replace(/\s*-\s*(?=\S)/g, " "),
      }));

      setProducts((prevProducts) =>
        currentPage === 1
          ? productsWithImages
          : [...prevProducts, ...productsWithImages]
      );
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, filters]);

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
  }, [category, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterProducts = useCallback(() => {
    return products
      .filter((product) => {
        if (
          searchTerm &&
          !product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (
          filters.priceRange &&
          (product.price < filters.priceRange[0] ||
            product.price > filters.priceRange[1])
        ) {
          return false;
        }

        if (filters.sizes?.length > 0) {
          if (!product.size || !Array.isArray(product.size)) return false;
          return filters.sizes.every((size) => product.size.includes(size));
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "price_asc") return a.price - b.price;
        if (filters.sort === "price_desc") return b.price - a.price;
        return 0;
      });
  }, [products, searchTerm, filters]);

  const handleLoadMore = () => {
    if (!loading && pagination.has_next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const filteredProducts = filterProducts();

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchProducts();
          }}
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold">{category}</h1>
      <div className="mb-4 text-gray-600">
        Found {filteredProducts.length} out of {pagination.total} products
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isCartItem={false}
            observer={observer}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      )}

      {!loading && pagination.has_next && (
        <div className="text-center py-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
