import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAdminLogout = () => {
    dispatch(logout());
    localStorage.removeItem("admin_token");
    navigate("/admin-login");
    window.location.reload();
  };

  const navItems = [
    { path: '/admin/add-product', label: 'Add Product' },
    { path: '/admin/approve-products', label: 'Pending Approvals' },
    { path: '/admin/manage-users', label: 'Users' },
    { path: '/admin/manage-orders', label: 'Orders' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-xl font-bold cursor-pointer" 
                onClick={() => navigate('/admin/dashboard')}>
              Admin Dashboard
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActivePath(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleAdminLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActivePath(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleAdminLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;