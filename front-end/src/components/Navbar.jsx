import React, { useState } from "react";
import { Router, Link, Navigate } from "react-router-dom";
import {
  IconName,
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineCamera,
  AiOutlineUser,
  AiOutlineMenu,
  AiOutlineClose,
} from "react-icons/ai";

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle search toggle
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className="relative flex justify-between items-center px-6 py-4 bg-white shadow-md">
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
          <AiOutlineShoppingCart />
        </button>
        <button>
          <AiOutlineUser />
        </button>
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
