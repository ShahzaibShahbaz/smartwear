import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black">SMART wear</h3>
            <p className="text-gray-600 text-sm">
              Your one-stop destination for premium fashion without having to
              leave your home.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/#collections"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/your-orders"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/size-guide"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4" />
                <span>smartwearauth@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4" />
                <span>+92 321 1896779</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} SMART wear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
