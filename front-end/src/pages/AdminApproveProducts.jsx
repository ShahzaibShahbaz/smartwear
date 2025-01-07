import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminApproveProducts = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [disapprovedProducts, setDisapprovedProducts] = useState([]);

  // Fetch products by status
  const fetchProducts = async () => {
    try {
      const [pendingRes, approvedRes, disapprovedRes] = await Promise.all([
        axios.get("http://localhost:8000/products/pending"),
        axios.get("http://localhost:8000/products/approved"),
        axios.get("http://localhost:8000/products/disapproved"),
      ]);
      setPendingProducts(pendingRes.data);
      setApprovedProducts(approvedRes.data);
      setDisapprovedProducts(disapprovedRes.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await axios.patch(`http://localhost:8000/products/${productId}/approve`);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error approving product:", error);
    }
  };

  const handleDisapprove = async (productId) => {
    try {
      await axios.patch(`http://localhost:8000/products/${productId}/disapprove`);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error disapproving product:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProducts = (products, actions = true) =>
    products.map((product) => (
      <div
        key={product._id}
        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg mb-2"
      >
        <div>
          <h3 className="font-semibold">{product.name}</h3>
          {/* <p className="text-sm text-gray-600">{product.description}</p> */}
        </div>
        <div >
          {actions && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                onClick={() => handleApprove(product._id)}
                className="text-xs sm:text-sm text-white bg-green-600 px-2 sm:px-3 py-1 rounded-full mr-1 sm:mr-2 hover:bg-green-600"
                >
                Approve
              </button>
              <button
                onClick={() => handleDisapprove(product._id)}
                className="text-xs sm:text-sm text-white bg-red-600 px-2 sm:px-3 py-1 rounded-full hover:bg-red-600"
                >
                Disapprove
              </button>
            </div>
          )}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Product Approval Dashboard</h1>

      {/* Pending Products */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Products</h2>
        {pendingProducts.length > 0 ? (
          renderProducts(pendingProducts)
        ) : (
          <p className="text-gray-500">No pending products.</p>
        )}
      </div>

      {/* Approved Products */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Approved Products</h2>
        {approvedProducts.length > 0 ? (
          renderProducts(approvedProducts, false) // No actions for approved products
        ) : (
          <p className="text-gray-500">No approved products.</p>
        )}
      </div>

      {/* Disapproved Products */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Disapproved Products</h2>
        {disapprovedProducts.length > 0 ? (
          renderProducts(disapprovedProducts, false) // No actions for disapproved products
        ) : (
          <p className="text-gray-500">No disapproved products.</p>
        )}
      </div>
    </div>
  );
};

export default AdminApproveProducts;
