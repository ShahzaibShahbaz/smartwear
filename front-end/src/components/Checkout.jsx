import React from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { clearCart } from "../store/cartSlice"; // Assuming redux slice for cart
import { useNavigate } from "react-router-dom";

function Checkout() {
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
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log("Calculated total amount:", total); // Log the total to ensure it's correct
  
    // Create the order data object
    const orderData = {
      user_id: user.id,
      total_amount: total,  // Ensure total is passed correctly
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null, // Include size if available
      })),
    };
  
    // Log the order data before sending it
    console.log("Sending the following data to the server:", orderData); // Log the payload
  
    try {
      const orderResponse = await axios.post("http://127.0.0.1:8000/orders", orderData);
  
      // Log the response from the server after order placement
      console.log("Order response from server:", orderResponse.data);
  
      // Clear cart after successful order
      dispatch(clearCart());
  
      // Show success message and redirect
      alert(
        `Order placed successfully! Order ID: ${orderResponse.data.order_id}`
      );
      navigate("/orders"); // Redirect to orders page
    } catch (error) {
      if (error.response) {
        console.error("Checkout error response:", error.response.data);
        alert(`Failed to place order. Error: ${error.response.data.detail}`);
      } else {
        console.error("Checkout error:", error);
        alert("Failed to place order. Please try again.");
      }
    }
    
  };
  
  

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">Order Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Items</span>
          <span className="font-semibold">{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">${total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold">$0.00</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>
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
    </div>
  );
}

export default Checkout;
