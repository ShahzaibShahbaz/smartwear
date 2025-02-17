import React, { useState, useEffect } from "react";
import {
  Camera,
  ShoppingCart,
  Heart,
  User,
  X,
  Package,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { resetCart } from "../store/cartSlice";
import { persistor } from "../store/store";
import { toast } from "react-toastify";

const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Update username from localStorage
  useEffect(() => {
    const updateUsername = () => {
      const data = localStorage.getItem("user");
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          setUsername(parsedData.username || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUsername("");
        }
      } else {
        setUsername("");
      }
    };

    // Update username initially and whenever isAuthenticated changes
    updateUsername();
  }, [isAuthenticated]); // Depend on isAuthenticated state

  const handleLogout = async () => {
    try {
      // Clear persisted state
      await persistor.purge();

      // Dispatch logout actions
      dispatch(logout());
      dispatch(resetCart());

      // Clear local state
      setUsername("");

      // Close sidebar
      setSidebarOpen(false);

      // Clear localStorage
      localStorage.clear();

      // Navigate to home
      navigate("/", { replace: true });

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
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
                <span className="font-bold text-3xl">SMART</span>
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
                to={
                  location.pathname === "/" ? "#collections" : "/#collections"
                }
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
              <Link to="image-search" className="w-8 h-8">
                <Camera className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer" />
              </Link>
              <Link to="/cart" className="relative w-8 h-8">
                <ShoppingCart className="w-8 h-8 text-black-700 hover:text-gray-700 cursor-pointer" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
              {username && (
                <span className="text-sm font-medium">Hi, {username}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Menu</h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {username && (
              <p className="mt-2 text-sm text-gray-600">
                Welcome back, <span className="font-medium">{username}</span>
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Your Account
                    </h3>
                    <div className="space-y-2">
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/your-orders");
                          setSidebarOpen(false);
                        }}
                      >
                        <Package className="w-5 h-5 mr-3" />
                        <span>Your Orders</span>
                      </button>
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/wishlist");
                          setSidebarOpen(false);
                        }}
                      >
                        <Heart className="w-5 h-5 mr-3" />
                        <span>Your Wishlist</span>
                      </button>
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/cart");
                          setSidebarOpen(false);
                        }}
                      >
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        <span>Your Cart</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Shop by Category
                    </h3>
                    <div className="space-y-2">
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/products/Men");
                          setSidebarOpen(false);
                        }}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        <span>Men's Collection</span>
                      </button>
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/products/Women");
                          setSidebarOpen(false);
                        }}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        <span>Women's Collection</span>
                      </button>
                      <button
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate("/products/kids");
                          setSidebarOpen(false);
                        }}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        <span>Kids Collection</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Sign in to view your orders, wishlist, and more.
                  </p>
                  <Link
                    to="/signin"
                    className="block w-full px-4 py-3 text-center bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {isAuthenticated && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center justify-center text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-15 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
