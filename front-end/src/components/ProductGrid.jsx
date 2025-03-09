import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loader } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category}</h1>
          <p className="mt-2 text-gray-600">
            Found {filteredProducts.length} out of {pagination.total} products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
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
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      )}

      {!loading && pagination.has_next && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            className="
              px-8 py-3 bg-black text-white rounded-lg
              transition-all duration-200
              hover:bg-gray-900 hover:shadow-md
              active:transform active:scale-95
            "
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
