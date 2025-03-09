import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../../components/Footer";
import { Package, Truck, CheckCircle, Clock, ChevronLeft } from "lucide-react";

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

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "confirmed":
        return <Package className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
            <p className="mt-2 text-gray-600">Track your orders here</p>
          </div>

          {/* Selected Order Details */}
          {selectedOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Back to Orders
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Order #{selectedOrder.order_id}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Total: PKR {selectedOrder.total.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full ${getStatusColor(
                      selectedOrder.status
                    )} border flex items-center gap-2`}
                  >
                    <StatusIcon status={selectedOrder.status} />
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name || `Product #${item.product_id}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} | Size: {item.size}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: PKR {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Shipping Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p>
                        <span className="font-medium">Name: </span>
                        {selectedOrder.formData.firstName}{" "}
                        {selectedOrder.formData.lastName}
                      </p>
                      <p>
                        <span className="font-medium">Address: </span>
                        {selectedOrder.formData.address}
                      </p>
                      <p>
                        <span className="font-medium">City: </span>
                        {selectedOrder.formData.city}
                      </p>
                      <p>
                        <span className="font-medium">ZIP: </span>
                        {selectedOrder.formData.zip}
                      </p>
                      <p>
                        <span className="font-medium">Phone: </span>
                        {selectedOrder.formData.phone}
                      </p>
                      <p>
                        <span className="font-medium">Email: </span>
                        {selectedOrder.formData.email}
                      </p>
                      <p>
                        <span className="font-medium">Payment Method: </span>
                        {selectedOrder.formData.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          {!selectedOrder && (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => handleOrderClick(order.order_id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_id}
                      </h3>
                      <p className="text-gray-600">
                        Total: PKR {order.total.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`mt-4 sm:mt-0 self-start px-4 py-2 rounded-full ${getStatusColor(
                        order.status
                      )} border flex items-center gap-2`}
                    >
                      <StatusIcon status={order.status} />
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage;
