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

  // Redux state
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
        // Scrolling UP or at top of page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        // Scrolling DOWN and not at top
        setIsVisible(false);
        // Close mobile menu and search when hiding navbar
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
    dispatch(logout()); // Dispatch logout action
    dispatch(resetCart()); // Dispatch resetCart action to clear Redux cart state
    localStorage.removeItem("persist:cart");
    // Purge persisted state (cart) from localStorage
    persistor.purge().then(() => {
      // Optional: Flush any changes made to persisted state
      persistor.flush();
    });
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
        {isAuthenticated && (
          <li className="p-4 md:p-0">
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-black"
            >
              Logout
            </button>
          </li>
        )}
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

        {!isAuthenticated ? (
          <>
            <button>
              <Link to="/signin" className="text-gray-700 hover:text-black">
                Login
              </Link>
            </button>
            <button>
              <Link to="/signup" className="text-gray-700 hover:text-black">
                Signup
              </Link>
            </button>
          </>
        ) : (
          <button>
            <AiOutlineUser />
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="block md:hidden text-2xl text-gray-700 hover:text-black"
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
    </nav>
  );
}

export default Navbar;
