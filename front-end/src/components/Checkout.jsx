import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Checkout({ showButton = true }) {
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!isAuthenticated || !user || !token) {
      toast.error("Please log in to continue", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (items.length === 0) {
      toast.warn("Your cart is empty", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    navigate("/placeorder");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Items ({totalItems})</span>
          <span className="text-gray-900">PKR {total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span className="text-gray-900">Free</span>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-medium text-gray-900">
              PKR {total}
            </span>
          </div>
        </div>
      </div>

      {showButton && (
        <button
          onClick={handleCheckout}
          disabled={totalItems === 0}
          className={`
            w-full mt-6 px-6 py-3 rounded-lg text-sm font-medium
            transition-all duration-200
            ${
              totalItems === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 active:transform active:scale-[0.98]"
            }
          `}
        >
          {totalItems === 0 ? "Cart is Empty" : "Proceed to Checkout"}
        </button>
      )}
    </div>
  );
}

export default Checkout;
