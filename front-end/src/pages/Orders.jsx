import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/orders?user_id=${user.id}`
      );
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Fetch specific order by ID
  const fetchOrderById = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/orders/${orderId}`);
      const data = await response.json();
      setSelectedOrder(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderClick = (orderId) => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-24">
          {loading && <div className="text-center py-4">Loading...</div>}
          {error && (
            <div className="text-red-600 text-center py-4">{error}</div>
          )}

          {/* Selected Order Card */}
          {selectedOrder && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{selectedOrder.order_id}
                  </h3>
                  <p className="text-gray-600">
                    Total: PKR {selectedOrder.total}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <p>Product ID: {item.product_id}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                      <p>Price: PKR {item.price}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Shipping Details</h4>
                  <p>
                    {selectedOrder.formData.firstName}{" "}
                    {selectedOrder.formData.lastName}
                  </p>
                  <p>{selectedOrder.formData.address}</p>
                  <p>
                    {selectedOrder.formData.city},{" "}
                    {selectedOrder.formData.country}
                  </p>
                  <p>ZIP: {selectedOrder.formData.zip}</p>
                  <p>Phone: {selectedOrder.formData.phone}</p>
                  <p>Email: {selectedOrder.formData.email}</p>
                  <p>Payment Method: {selectedOrder.formData.paymentMethod}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white  p-1 bg-black  rounded-md text-lg"
              >
                Back to All Orders
              </button>
            </div>
          )}

          {/* All Orders List */}
          {!selectedOrder && (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => handleOrderClick(order.order_id)}
                  className="p-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Order #{order.order_id}</h3>
                      <p className="text-gray-600">Total: ${order.total}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
