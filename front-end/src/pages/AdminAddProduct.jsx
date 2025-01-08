import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";


const AddProductForm = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: "",
    size: "",
    description: "",
    gender: "",
    subcategory: "",
    color: "",
    product_type: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    for (const key in formData) {
        if (!formData[key].trim()) {
          setError(`The field "${key}" is required.`);
          return;
        }
      }
    try {
      const sizeArray = formData.size.split(",").map((s) => s.trim());
      await axios.post("http://localhost:8000/products/add", {
        ...formData,
        size: sizeArray,
        price: parseFloat(formData.price),
      });
      setSuccess(true);
      setFormData({
        name: "",
        price: "",
        image_url: "",
        size: "",
        description: "",
        gender: "",
        subcategory: "",
        color: "",
        product_type: "",
      });
      navigate("/admin/dashboard")
    } catch (err) {
      setError("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Add Admin Navbar */}
      <AdminNavbar />
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-10 shadow-lg rounded-lg max-w-3xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Add New Product</h2>
        {success && <p className="text-green-500 mb-4 text-center">Product added successfully!</p>}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="text"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image_url"
                placeholder="Enter image URL"
                value={formData.image_url}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
              <input
                type="text"
                name="size"
                placeholder="Enter sizes (e.g., S, M, L)"
                value={formData.size}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <input
                type="text"
                name="gender"
                placeholder="Enter gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                placeholder="Enter subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="color"
                placeholder="Enter color"
                value={formData.color}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <input
                type="text"
                name="product_type"
                placeholder="Enter product type"
                value={formData.product_type}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="4"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-3 px-6 mt-6 w-full rounded-lg hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddProductForm;