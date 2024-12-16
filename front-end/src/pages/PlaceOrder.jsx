import React, { useState } from "react";
import { Link } from "react-router-dom";
import Checkout from "../components/Checkout";
import ConfirmOrder from "../components/ConfirmOrder";

function PlaceOrder() {
  const [orderData, setOrderData] = useState(null); // To store order data after checkout

  // Function to pass order data to the confirmation page
  const handleCheckoutSubmit = (data) => {
    setOrderData(data);
  };

  return (
    <div className="place-order-container p-6 bg-white shadow-lg rounded-lg mx-auto mt-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8">Place Your Order</h1>

      <div className="steps-container mb-6 flex justify-between"></div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Checkout showButton={false} onSubmit={handleCheckoutSubmit} />
        </div>
        <div className="flex-1">
          <ConfirmOrder orderData={orderData} />
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
