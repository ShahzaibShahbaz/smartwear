import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineCamera,
  AiOutlineUser,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineHeart,
} from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; // Import the logout action
import { resetCart } from "../store/cartSlice";
import { persistor } from "../store/store"; // Import persistor

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
        setMobileMenuOpen(false);
        setIsSearchOpen(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  // Handle search toggle
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    localStorage.removeItem("persist:cart");
    persistor.purge().then(() => {
      persistor.flush();
    });
    setSidebarOpen(false); // Close sidebar after logout
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 bg-white shadow-md transition-transform duration-300 z-50 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="text-2xl font-bold">
        <Link to="/">
          SMART <span className="font-normal">wear</span>
        </Link>
      </div>

      {/* Menu (responsive) */}
      <ul
        className={`absolute top-16 left-0 w-full bg-white md:static md:flex md:gap-8 md:top-0 md:w-auto transition-transform duration-300 ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <li className="p-4 md:p-0 border-b md:border-none">
          <Link to="/" className="text-gray-700 hover:text-black">
            Home
          </Link>
        </li>
        <li className="p-4 md:p-0 border-b md:border-none">
          <Link to="/collections" className="text-gray-700 hover:text-black">
            Collections
          </Link>
        </li>
        <li className="p-4 md:p-0">
          <a href="/contact-us" className="text-gray-700 hover:text-black">
            Contact Us
          </a>
        </li>
      </ul>

      {/* Icons with Search */}
      <div className="flex gap-4 text-2xl items-center">
        <div className="relative flex items-center">
          {isSearchOpen && (
            <input
              type="text"
              placeholder="Search..."
              className={`
                transition-all duration-300 ease-in-out
                border border-gray-300 rounded-lg
                ${isMobileView ? "absolute top-10 right-0 w-48" : "mr-2 w-48"}
                ${isSearchOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                p-2 text-sm
              `}
              autoFocus
            />
          )}
          <button onClick={toggleSearch}>
            <AiOutlineSearch />
          </button>
        </div>
        <button>
          <AiOutlineCamera />
        </button>

        <button>
          <Link to="/cart">
            <AiOutlineShoppingCart />
          </Link>
        </button>

        <button>
          <Link to="/wishlist" className="text-gray-700 hover:text-black">
            <AiOutlineHeart />
          </Link>
        </button>

        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <AiOutlineUser className="text-gray-700 hover:text-black" />
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="block md:hidden text-2xl text-gray-700 hover:text-black"
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0  h-full bg-white shadow-lg z-50 w-full md:w-1/3 lg:w-1/4 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-black"
          onClick={() => setSidebarOpen(false)}
        >
          <AiOutlineClose />
        </button>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-4 bg-white">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-3/4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/signin"
                className="w-3/4 text-center bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-900"
                onClick={() => setSidebarOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="w-3/4 text-center bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
