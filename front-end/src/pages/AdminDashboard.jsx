import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; // Import the action

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAdminLogout = () => {
    dispatch(logout()); // Dispatch adminLogout action
    navigate("/admin-login"); // Redirect to admin login page
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleAdminLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Sign Out
        </button>
      </nav>

      {/* Dashboard Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Welcome Message */}
        <h1 className="text-2xl font-bold text-gray-800 mt-8 ml-8">
          Welcome to Admin Dashboard!
        </h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          {/* Add Product Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Add Products
            </h2>
            <p className="text-gray-600 mb-4">
              Add new products to your store and update the catalog.
            </p>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
              disabled
            >
              Go to Add Products
            </button>
          </div>

          {/* Approve/Disapprove Products Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Approve/Disapprove Products
            </h2>
            <p className="text-gray-600 mb-4">
              Approve or reject products submitted for listing.
            </p>
            <button
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
              disabled
            >
              Go to Product Approvals
            </button>
          </div>

          {/* Manipulate Users Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Manipulate Users
            </h2>
            <p className="text-gray-600 mb-4">
              Manage user roles, ban users, or reset user data.
            </p>
            <button
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
              disabled
            >
              Go to User Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
