import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAdminLogout = () => {
    dispatch(logout());
    localStorage.removeItem("admin_token");
    navigate("/admin-login");
    window.location.reload();
  };

  // Mock chart data
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales",
        data: [300, 400, 200, 500, 700, 600],
        backgroundColor: "#4F46E5",
        borderRadius: 5,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Analytics",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={handleAdminLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </nav>

      <div className="p-6">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaUsers className="text-3xl text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Users</h2>
              <p className="text-2xl font-bold text-gray-800">24</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaShoppingCart className="text-3xl text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Products</h2>
              <p className="text-2xl font-bold text-gray-800">67</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaChartLine className="text-3xl text-yellow-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
              <p className="text-2xl font-bold text-gray-800">5</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaUsers className="text-3xl text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Pending Approvals
              </h2>
              <p className="text-2xl font-bold text-gray-800">23</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Sales Analytics
          </h2>
          <div style={{ height: "400px" }}>
            <Bar data={chartData} options={options} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add Products */}
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-white cursor-pointer"
            onClick={() => navigate("/admin/add-product")}
          >
            <h2 className="text-xl font-semibold mb-2">Add Products</h2>
            <p>Add new products to your store and update the catalog.</p>
          </div>

          {/* Approve/Disapprove Products */}
          <div
            className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-white cursor-pointer"
            onClick={() => navigate("/admin/approve-products")}
          >
            <h2 className="text-xl font-semibold mb-2">
              Approve/Disapprove Products
            </h2>
            <p>Approve or reject products submitted for listing.</p>
          </div>

          {/* Manage Users */}
          <div
            className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-white cursor-pointer"
            onClick={() => navigate("/admin/manage-users")}
          >
            <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
            <p>Manage user roles, ban users, or reset user data.</p>
          </div>

          {/* Manage Orders */}
          <div
            className="bg-gradient-to-r from-purple-500 to-violet-500 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-white cursor-pointer"
            onClick={() => navigate("/admin/manage-orders")}
          >
            <h2 className="text-xl font-semibold mb-2">Manage Orders</h2>
            <p>Track, update, and manage customer orders seamlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
