import React, { useState } from "react";

const Sidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    sizes: [],
    categories: [],
    colors: [],
    priceRange: [0, 1000],
    tags: [],
  });

  const updateFilter = (filterType, value) => {
    const newFilters = { ...filters };
    if (filterType === "priceRange") {
      newFilters[filterType] = value; // For non-array filters like price range
    } else {
      const index = newFilters[filterType].indexOf(value);
      if (index > -1) {
        newFilters[filterType].splice(index, 1); // Remove if already selected
      } else {
        newFilters[filterType].push(value); // Add if not selected
      }
    }
    setFilters(newFilters);
    onFilterChange(newFilters); // Notify parent of filter change
  };

  const renderSizeFilter = () => {
    const sizes = ["XS", "S", "M", "L", "XL", "2XL"];
    return (
      <div>
        <h4 className="font-bold mb-2">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => updateFilter("sizes", size)}
              className={`px-3 py-1 border rounded ${
                filters.sizes.includes(size)
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCategoryFilter = () => {
    const categories = [
      "Shirts",
      "T-Shirts",
      "Polo Shirts",
      "Jeans",
      "Jackets",
    ];
    return (
      <div>
        <h4 className="font-bold mb-2">Category</h4>
        <select
          className="w-full border rounded p-2"
          onChange={(e) => updateFilter("categories", e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderColorFilter = () => {
    const colors = ["Red", "Blue", "Green", "Yellow", "Black"];
    return (
      <div>
        <h4 className="font-bold mb-2">Color</h4>
        <div className="flex gap-2">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => updateFilter("colors", color)}
              style={{
                backgroundColor: color.toLowerCase(),
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: filters.colors.includes(color)
                  ? "2px solid black"
                  : "1px solid gray",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPriceRangeFilter = () => {
    return (
      <div>
        <h4 className="font-bold mb-2">Price Range</h4>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            className="border p-2 rounded w-20"
            value={filters.priceRange[0]}
            min="0"
            max="1000"
            onChange={(e) =>
              updateFilter("priceRange", [
                parseInt(e.target.value),
                filters.priceRange[1],
              ])
            }
          />
          <span>to</span>
          <input
            type="number"
            className="border p-2 rounded w-20"
            value={filters.priceRange[1]}
            min="0"
            max="1000"
            onChange={(e) =>
              updateFilter("priceRange", [
                filters.priceRange[0],
                parseInt(e.target.value),
              ])
            }
          />
        </div>
      </div>
    );
  };

  const renderTagsFilter = () => {
    const tags = ["New Arrival", "Best Seller", "Discounted"];
    return (
      <div>
        <h4 className="font-bold mb-2">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => updateFilter("tags", tag)}
              className={`px-3 py-1 border rounded ${
                filters.tags.includes(tag)
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      {renderSizeFilter()}
      {renderCategoryFilter()}
      {renderColorFilter()}
      {renderPriceRangeFilter()}
      {renderTagsFilter()}
    </div>
  );
};

export default Sidebar;
