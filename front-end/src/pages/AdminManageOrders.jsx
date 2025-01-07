import React, { useEffect, useState } from "react";
import axios from "axios";

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
      const response = await axios.get("http://localhost:8000/getorders");
      setOrders(response.data);
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert("Failed to update order status. Please try again.");
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Order ID</th>
              <th className="border p-2">User Email</th>
              <th className="border p-2">Total Amount</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border p-2">{order._id}</td>
                <td className="border p-2">
                  {order.formData && order.formData.email
                    ? order.formData.email
                    : "N/A"}
                </td>
                <td className="border p-2">${order.total_amount}</td>
                <td className="border p-2">{order.status}</td>
                <td className="border p-2">
                  {["confirmed", "shipped", "completed"].map((status) => (
                    <button
                      key={status}
                      className={`m-1 px-3 py-1 rounded ${
                        order.status === status
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white"
                      }`}
                      onClick={() => updateOrderStatus(order._id, status)}
                      disabled={order.status === status}
                    >
                      {status}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageOrders;
