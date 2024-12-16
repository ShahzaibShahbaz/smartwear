import React from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { clearCart } from "../store/cartSlice"; // Assuming redux slice for cart
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Checkout({ showButton = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("Please log in to proceed with checkout");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Calculate the total amount
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order data object

    navigate("/placeorder");
  };

  return (
    <>
      <Navbar />
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold text-center mb-6">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Items</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">PKR {total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">PKR 0.00</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>PKR {total}</span>
          </div>
        </div>
        {showButton && (
          <button
            onClick={handleCheckout}
            disabled={totalItems === 0}
            className={`w-full mt-6 py-3 rounded-lg transition-colors ${
              totalItems === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Proceed to Checkout
          </button>
        )}
      </div>
    </>
  );
}

export default Checkout;
