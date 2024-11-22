import React, { useState } from 'react';

function Navbar() {
    // State to manage the mobile menu visibility
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="relative flex justify-between items-center px-6 py-4 bg-white shadow-md">
            {/* Logo */}
            <div className="text-2xl font-bold">
                SMART <span className="font-normal">wear</span>
            </div>

            {/* Menu (responsive) */}
            <ul
                className={`absolute top-16 left-0 w-full bg-white md:static md:flex md:gap-8 md:top-0 md:w-auto transition-transform duration-300 ${
                    isMobileMenuOpen ? 'block' : 'hidden'
                }`}
            >
                <li className="p-4 md:p-0 border-b md:border-none">
                    <a href="/" className="text-gray-700 hover:text-black">
                        Home
                    </a>
                </li>
                <li className="p-4 md:p-0 border-b md:border-none">
                    <a href="/" className="text-gray-700 hover:text-black">
                        Collection
                    </a>
                </li>
                <li className="p-4 md:p-0">
                    <a href="/" className="text-gray-700 hover:text-black">
                        Deals
                    </a>
                </li>
            </ul>

            {/* Icons */}
            <div className="flex gap-4 text-2xl">
                <button className="text-gray-700 hover:text-black">🔍</button>
                <button className="text-gray-700 hover:text-black">📷</button>
                <button className="text-gray-700 hover:text-black">🛒</button>
                <button className="text-gray-700 hover:text-black">👤</button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="block md:hidden text-2xl text-gray-700 hover:text-black"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? '✕' : '☰'}
            </button>
        </nav>
    );
}

export default Navbar;
