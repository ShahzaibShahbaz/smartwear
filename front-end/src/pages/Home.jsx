// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Import all images
import kids from "../Assets/kids.jpg";
import women from "../Assets/women.jpg";
import men from "../Assets/men.jpg";

function Home() {
  // Array of images - Add your actual imported images here
  const images = [kids, women, men];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to go to next image
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextImage, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="relative inline-block w-full h-screen overflow-hidden">
        {/* Image container with fade transition */}
        <img
          src={images[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        {/* Slideshow indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-gray-400"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>

        {/* Shop Now button */}
        <Link to="/collections">
          <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black-700 hover:text-gray-700 text-6xl font-bold ">
            Shop Now!
          </h1>
        </Link>

        {/* Chatbot Navigation Button */}
        <Link to="/chatbot">
          <button className="fixed bottom-8 right-8 bg-[#515151] text-white p-4 rounded-full shadow-lg">
            🗨️
          </button>
        </Link>
      </div>
    </>
  );
}

export default Home;
