import React, { useState } from "react";
import TopFilterBar from "../../components/TopFilterBar";
import SearchBar from "../../components/SearchBar";
import ProductGrid from "../../components/ProductGrid";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import Footer from "../../components/Footer";

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { category } = useParams();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-20">
        <div className="mb-2">
          <SearchBar onSearch={handleSearch} />
          <TopFilterBar onFilterChange={handleFilterChange} />
        </div>
        <ProductGrid
          searchTerm={searchTerm}
          filters={filters}
          category={category}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
