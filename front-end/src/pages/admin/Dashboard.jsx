import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminNavbar from "../../components/AdminNavbar";
import { Bar, Pie, Line  } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import {
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  // States for dynamic data
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Add new states for product status and order trends
  const [productStatus, setProductStatus] = useState({
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [orderTrends, setOrderTrends] = useState([]);

  // Fetch data from API
    // Update useEffect to fetch additional data
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [usersRes, productsRes, ordersRes, approvalsRes] = await Promise.all([
            fetch("http://localhost:8000/users"),
            fetch("http://localhost:8000/products/get"),
            fetch("http://localhost:8000/getorders"),
            fetch("http://localhost:8000/products/pending")
          ]);
  
          const [usersData, productsData, ordersData, approvalsData] = await Promise.all([
            usersRes.json(),
            productsRes.json(),
            ordersRes.json(),
            approvalsRes.json()
          ]);
  
          setUsersCount(usersData.users.length || 0);
          setProductsCount(productsData.products.length || 0);
          setOrdersCount(ordersData.length || 0);
          setPendingApprovals(approvalsData.length || 0);
  
          // Set product status data
          setProductStatus({
            approved: productsData.products.filter(p => p.status === 'approved').length,
            pending: approvalsData.length,
            rejected: productsData.products.filter(p => p.status === 'disapproved').length
          });
  
          // Calculate order trends (last 7 days)
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();
  
          const trends = last7Days.map(date => ({
            date,
            count: ordersData.filter(order => 
              new Date(order.createdAt).toISOString().split('T')[0] === date
            ).length
          }));
  
          setOrderTrends(trends);
  
        } catch (error) {
          console.error("Failed to fetch admin data:", error);
        }
      };
  
      fetchData();
    }, []);

  // Sales chart data
  const salesData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales",
        data: [300, 400, 200, 500, 700, 600],
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderRadius: 5,
      },
    ],
  };

  // Product status chart data
  const productStatusData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          productStatus.approved,
          productStatus.pending,
          productStatus.rejected
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",  // green
          "rgba(236, 227, 63, 0.8)",   // yellow
          "rgba(235, 43, 43, 0.81)",   // red
        ],
        // borderColor: [
        //   "rgb(34, 197, 94)",
        //   "rgb(234, 179, 8)",
        //   "rgb(239, 68, 68)",
        // ],
        // borderWidth: 1,
      },
    ],
  };

  // Order trends chart data
  const orderTrendsData = {
    labels: orderTrends.map(t => t.date),
    datasets: [
      {
        label: "Orders",
        data: orderTrends.map(t => t.count),
        fill: true,
        // borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(117, 12, 215, 0.88)",
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Sales",
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Product Status Distribution",
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Order Trends (Last 7 Days)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Insights</h2>
        </div>
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaShoppingCart className="text-3xl text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Products</h2>
              <p className="text-2xl font-bold text-gray-800">
                {productsCount}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaUsers className="text-3xl text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Pending Approvals
              </h2>
              <p className="text-2xl font-bold text-gray-800">
                {pendingApprovals}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaUsers className="text-3xl text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Users</h2>
              <p className="text-2xl font-bold text-gray-800">{usersCount}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition duration-300 flex items-center space-x-4">
            <FaChartLine className="text-3xl text-yellow-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
              <p className="text-2xl font-bold text-gray-800">{ordersCount}</p>
            </div>
          </div>
          
        </div>
        {/* ------------------------------------------------------------------------------------------------------*/}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Management</h2>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* ------------------------------------------------------------------------------------------------------*/}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Charts</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div style={{ height: "400px" }}>
              <Bar data={salesData} options={barOptions} />
            </div>
          </div>

          {/* Product Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div style={{ height: "400px" }}>
              <Pie data={productStatusData} options={pieOptions} />
            </div>
          </div>

          {/* Order Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
            <div style={{ height: "400px" }}>
              <Line data={orderTrendsData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;