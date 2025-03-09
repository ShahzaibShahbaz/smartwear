import React, { useEffect, useState } from "react";
import { Loader2, Package, Mail, DollarSign, Clock } from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/getorders");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert("Failed to update order status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Manage Orders</h1>
        
        {orders.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg bg-white">
            <p className="text-lg text-gray-500">No orders available.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="rounded-lg bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="p-6">
                  {/* Rest of the card content remains the same, just removed Card wrapper */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-500" />
                      <span className="font-mono text-sm text-gray-600">
                        {order._id.slice(-8)}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order.formData?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        Rs {order.total_amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {["confirmed", "shipped", "completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        disabled={order.status === status}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
                          ${
                            order.status === status
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                          }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ManageOrders;