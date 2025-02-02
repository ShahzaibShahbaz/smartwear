import React, { useState, useEffect } from "react";
import { Camera, ShoppingCart, Heart, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { resetCart } from "../store/cartSlice";
import { persistor } from "../store/store";

const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.username) {
          setUsername(parsedData.username);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    localStorage.removeItem("persist:cart");
    persistor.purge().then(() => {
      persistor.flush();
    });
    setSidebarOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav
        className={`fixed w-full bg-gray-100 shadow-sm transition-transform duration-300 z-50 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0 pl-0">
              <div className="flex items-center">
                <span className="font-bold text-3xl ">SMART</span>
                <span className="ml-1 text-3xl font-normal">wear</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-black-700 hover:text-gray-700 text-2xl font-medium"
              >
                Home
              </Link>
              <Link
                to="/collections"
                className="text-black-700 hover:text-gray-700 text-2xl font-medium"
              >
                Collections
              </Link>
              <Link
                to="/contact-us"
                className="text-black-700 hover:text-gray-700 text-2xl font-medium"
              >
                Contact Us
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6 pr-0">
              <Link to="/" className="w-8 h-8">
                <Camera className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer " />
              </Link>
              <Link to="/cart" className="relative w-8 h-8">
                <ShoppingCart className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 text-xs text-white bg-red-600 rounded-full px-1">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link to="/wishlist" className="w-8 h-8">
                <Heart className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer" />
              </Link>
              <User
                className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              />
              {username && <span>hi, {username}</span>}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mt-12 space-y-4">
            {isAuthenticated ? (
              <>
                <button
                  className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800"
                  onClick={() => {
                    navigate("/your-orders");
                  }}
                >
                  Your Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block w-full text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                  onClick={() => setSidebarOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center border border-black text-black py-2 px-4 rounded hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-15 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default Navbar;
