import React, { useState } from "react";
import { Filter, ChevronDown, Zap, X } from "lucide-react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Button,
  IconButton,
} from "@mui/material";

const TopFilterBar = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const sizes = ["XS", "S", "M", "L", "XL", "Unstiched"];

  const sortOptions = [
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  const handleSortChange = (value) => {
    onFilterChange((prev) => ({ ...prev, sort: value }));
    setShowSort(false);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleApplyFilters = () => {
    onFilterChange({
      priceRange,
      sizes: selectedSizes,
    });
    setShowFilters(false);
  };

  const handleReset = () => {
    setPriceRange([0, 50000]);
    setSelectedSizes([]);

    onFilterChange({});
    setShowFilters(false);
  };

  return (
    <>
      <div className="w-full bg-white shadow-sm rounded-lg p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md border"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              <span>Sort</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSort && (
              <div className="fixed mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Filters</h2>
            <IconButton onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Price</h3>
              <div className="flex justify-between mb-2">
                <span>PKR{priceRange[0].toLocaleString()}</span>
                <span>PKR{priceRange[1].toLocaleString()}</span>
              </div>
              {/* <Slider
                value={priceRange}
                min={0}
                max={200000}
                step={1000}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
              /> */}

              <Slider
                getAriaLabel={() => "Temperature range"}
                value={priceRange}
                min={0}
                max={50000}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                color="black"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Size</h3>
              <div className="flex flex-wrap gap-2 items-center justify-center">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${
                selectedSizes.includes(size)
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
              }
            `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset} variant="outlined" color="black">
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            color="black"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopFilterBar;
