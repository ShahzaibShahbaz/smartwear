import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import ProductGrid from "../components/ProductGrid";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

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
      <div className="container mx-auto px-4 pt-24 md:pt-28 flex flex-col md:flex-row">
        <div className="w-full md:w-64 md:mr-8 mb-6 md:mb-0">
          <Sidebar onFilterChange={handleFilterChange} />
        </div>
        <div className="flex-1">
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} />
          </div>
          <ProductGrid
            searchTerm={searchTerm}
            filters={filters}
            category={category}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
