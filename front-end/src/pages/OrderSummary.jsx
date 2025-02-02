import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import { toast } from "react-toastify";

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const orderData = location.state?.orderData;

  useEffect(() => {
    const clearCartData = async () => {
      try {
        // Clear cart on the server
        await axios.post(
          "http://localhost:8000/cart/sync",
          { items: [] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Clear cart in Redux
        dispatch(clearCart());
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Error clearing cart data");
      }
    };

    if (orderData) {
      clearCartData();
    }
  }, [dispatch, token, orderData]);

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const sendOrderEmail = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/send-order-email",
        orderData
      );
      console.log("Email sent:", response.data);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send order confirmation email");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-medium text-gray-900">
            Order Confirmed
          </h1>
          <p className="mt-2 text-gray-600">Order #{orderData.orderId}</p>
        </div>

        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {/* Customer Details Section */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contact Information
                </h3>
                <p className="text-gray-900">
                  {orderData.formData.firstName} {orderData.formData.lastName}
                </p>
                <p className="text-gray-900">{orderData.formData.email}</p>
                <p className="text-gray-900">{orderData.formData.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Delivery Address
                </h3>
                <p className="text-gray-900">{orderData.formData.address}</p>
                <p className="text-gray-900">
                  {orderData.formData.city}, {orderData.formData.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-gray-500 border-b border-gray-200">
                    <th className="py-3 text-left">Product</th>
                    <th className="py-3 text-right">Quantity</th>
                    <th className="py-3 text-right">Price</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderData.items.map((item, index) => (
                    <tr key={index} className="text-gray-900">
                      <td className="py-4 pr-4">{item.name}</td>
                      <td className="py-4 text-right">{item.quantity}</td>
                      <td className="py-4 text-right">
                        PKR {item.price.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan="3"
                      className="py-4 text-base font-medium text-gray-900 text-right"
                    >
                      Total
                    </td>
                    <td className="py-4 text-base font-medium text-gray-900 text-right">
                      PKR {orderData.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payment Method
            </h2>
            <p className="text-gray-900">
              {orderData.formData.paymentMethod === "COD"
                ? "Cash on Delivery"
                : orderData.formData.paymentMethod}
            </p>
          </div>

          {/* Actions Section */}
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  sendOrderEmail();
                  navigate("/#collections");
                }}
                className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium 
                         rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
