import React, { useState } from "react";
import axios from "axios";

// Initial form state
const initialFormData = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  country: "Pakistan",
  address: "",
  apartment: "",
  city: "",
  zip: "",
  shippingMethod: "",
  paymentMethod: "",
  paymentDetails: {
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    branchAddress: "",
  },
};

function CheckoutForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("contact"); // Tab state: contact, shipping, payment
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state
  const [error, setError] = useState(null); // Error state

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle nested payment details input changes
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      paymentDetails: {
        ...prevData.paymentDetails,
        [name]: value,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/checkout", formData);
      console.log("Checkout successful:", response.data);
      alert("Checkout successful!");
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("An error occurred during checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-form-container max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Checkout Information</h2>

      {/* Tab Navigation */}
      <div className="tabs flex justify-center mb-6">
        <button
          className={`tab-btn ${activeTab === "contact" ? "active" : ""}`}
          onClick={() => handleTabChange("contact")}
        >
          Contact Information
        </button>
        <button
          className={`tab-btn ${activeTab === "shipping" ? "active" : ""}`}
          onClick={() => handleTabChange("shipping")}
        >
          Shipping Address
        </button>
        <button
          className={`tab-btn ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => handleTabChange("payment")}
        >
          Payment Method
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Form Sections */}
      <form onSubmit={handleSubmit}>
        {activeTab === "contact" && (
          <div className="contact-form space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="block text-sm">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="block text-sm">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="shipping-form space-y-4">
            <div className="form-group">
              <label htmlFor="firstName" className="block text-sm">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="block text-sm">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <label htmlFor="address" className="block text-sm">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <label htmlFor="city" className="block text-sm">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <label htmlFor="zip" className="block text-sm">Zip Code</label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="payment-form space-y-4">
            <div className="form-group">
              <label htmlFor="paymentMethod" className="block text-sm">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Bank">Bank Deposit</option>
              </select>
            </div>

            {formData.paymentMethod === "Bank" && (
              <div className="bank-details space-y-4">
                <div className="form-group">
                  <label htmlFor="bankName" className="block text-sm">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.paymentDetails.bankName}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountTitle" className="block text-sm">Account Title</label>
                  <input
                    type="text"
                    id="accountTitle"
                    name="accountTitle"
                    value={formData.paymentDetails.accountTitle}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountNumber" className="block text-sm">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.paymentDetails.accountNumber}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="iban" className="block text-sm">IBAN</label>
                  <input
                    type="text"
                    id="iban"
                    name="iban"
                    value={formData.paymentDetails.iban}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="swiftCode" className="block text-sm">Swift Code</label>
                  <input
                    type="text"
                    id="swiftCode"
                    name="swiftCode"
                    value={formData.paymentDetails.swiftCode}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branchAddress" className="block text-sm">Branch Address</label>
                  <input
                    type="text"
                    id="branchAddress"
                    name="branchAddress"
                    value={formData.paymentDetails.branchAddress}
                    onChange={handlePaymentDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="submit-btn mt-6 flex justify-center">
          <button
            type="submit"
            className={`px-6 py-3 bg-black text-white rounded-lg ${isSubmitting ? "opacity-50" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;
