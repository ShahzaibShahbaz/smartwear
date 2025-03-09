import React, { useState } from "react";
import { Link } from "react-router-dom";
import Checkout from "../components/Checkout";
import ConfirmOrder from "../components/CheckoutForm";
import Navbar from "../components/Navbar";

const PlaceOrder = () => {
  const [orderData, setOrderData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleCheckoutSubmit = (data) => {
    setOrderData(data);
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Place Your Order
          </h1>

          {/* Order Sections */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <Checkout
                showButton={false}
                onSubmit={handleCheckoutSubmit}
                className="space-y-6"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Checkout Details</h2>
              <ConfirmOrder orderData={orderData} className="space-y-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
