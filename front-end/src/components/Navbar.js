import React from  'react';

function Navbar() {
    return(
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold">
        SMART <span className="font-normal">wear</span>
        </div>
        <ul className="flex gap-8">
            <li><a href="/" className="text-gray-700 hover:text-black">Home</a></li>
            <li><a href="/" className="text-gray-700 hover:text-black">Collection</a></li>
            <li><a href="/" className="text-gray-700 hover:text-black">Deals</a></li>
            
        </ul>
        <div className="flex gap-4 text-2xl">
                <button className="text-gray-700 hover:text-black">🔍</button>
                <button className="text-gray-700 hover:text-black">📷</button>
                <button className="text-gray-700 hover:text-black">🛒</button>
                <button className="text-gray-700 hover:text-black">👤</button>
            </div>

      </nav>  
    );
}
export default Navbar;
