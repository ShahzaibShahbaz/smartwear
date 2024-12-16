import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../store/cartSlice"; // Assuming redux slice for cart
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { toast, ToastContainer } from "react-toastify";

// Initial form state
const initialFormData = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  country: "Pakistan",
  address: "",
  city: "",
  zip: "",
  paymentMethod: "COD",
};

const CheckoutForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Update form data
  const updateFormData = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const allFields = [
      { tab: "contact", fields: ["email", "phone"] },
      {
        tab: "shipping",
        fields: ["firstName", "lastName", "address", "city", "zip"],
      },
      { tab: "payment", fields: ["paymentMethod"] },
    ];

    for (const section of allFields) {
      for (const field of section.fields) {
        // Trim the value to check for empty strings or just whitespace
        const value = formData[field] ? formData[field].trim() : "";

        if (!value) {
          // Set active tab to the section with the missing field
          setActiveTab(section.tab);

          return `Please fill out all required fields in the ${section.tab} section.`;
        }
      }
    }

    return null;
  };
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }
    const userID = user.id;
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      user_id: userID,
      total,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null, // Include size if available
      })),
      formData,
    };

    try {
      const orderResponse = await axios.post(
        "http://127.0.0.1:8000/orders",
        order
      );

      // Clear cart after successful order
      dispatch(clearCart());

      // Show success message and redirect

      toast.success(
        `Order placed successfully! Order ID: ${orderResponse.data.order_id}`
      );
    } catch (error) {
      if (error.response) {
        console.error("Checkout error response:", error.response.data);

        toast.error(
          `Failed to place order. Error: ${error.response.data.detail}`
        );
      } else {
        console.error("Checkout error:", error);

        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-form-container max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-3xl font-bold text-center mb-6">
          Complete Your Order
        </h2>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === "contact" && (
            <ContactTab formData={formData} updateFormData={updateFormData} />
          )}
          {activeTab === "shipping" && (
            <ShippingTab formData={formData} updateFormData={updateFormData} />
          )}
          {activeTab === "payment" && (
            <PaymentTab formData={formData} updateFormData={updateFormData} />
          )}

          {/* Submit Button */}

          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </div>
    </>
  );
};

// Reusable Components

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="tabs flex justify-center mb-6 space-x-4">
    {["contact", "shipping", "payment"].map((tab) => (
      <button
        key={tab}
        className={`tab-btn ${
          activeTab === tab ? "bg-black text-white" : "bg-gray-200 text-black"
        } px-4 py-2 rounded`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="text-red-500 text-center mb-4">{message}</div>
);

const ContactTab = ({ formData, updateFormData }) => (
  <div className="contact-form space-y-4">
    <InputField
      label="Email Address"
      name="email"
      value={formData.email}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
    <InputField
      label="Phone Number"
      name="phone"
      value={formData.phone}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
  </div>
);

const ShippingTab = ({ formData, updateFormData }) => (
  <div className="shipping-form space-y-4">
    <InputField
      label="First Name"
      name="firstName"
      value={formData.firstName}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
    <InputField
      label="Last Name"
      name="lastName"
      value={formData.lastName}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
    <InputField
      label="Address"
      name="address"
      value={formData.address}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
    <InputField
      label="City"
      name="city"
      value={formData.city}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
    <InputField
      label="Zip Code"
      name="zip"
      value={formData.zip}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
    />
  </div>
);

const PaymentTab = ({ formData, updateFormData }) => (
  <div className="payment-form space-y-4">
    <SelectField
      label="Payment Method"
      name="paymentMethod"
      value={formData.paymentMethod}
      onChange={(e) => updateFormData(e.target.name, e.target.value)}
      options={[{ value: "COD", label: "Cash on Delivery" }]}
    />
  </div>
);

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SubmitButton = ({ isSubmitting }) => (
  <div className="submit-btn mt-6 flex justify-center">
    <button
      type="submit"
      className={`px-6 py-3 bg-black text-white rounded-lg ${
        isSubmitting ? "opacity-50" : ""
      }`}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Submitting..." : "Submit Order"}
    </button>
    <ToastContainer />
  </div>
);

export default CheckoutForm;
