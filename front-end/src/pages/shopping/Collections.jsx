import React from "react";
import { motion } from "framer-motion"; // Changed from motion/react to framer-motion
import { Link } from "react-router-dom"; // Added Link for proper routing
import Navbar from "../../components/Navbar";
import menImage from "../Assets/men.jpg";
import womenImage from "../Assets/women.jpg";
import kidsImage from "../Assets/kids.jpg";

const Collections = () => {
  const categories = [
    { title: "MEN", image: menImage, link: "/products/Men" },
    { title: "WOMEN", image: womenImage, link: "/products/Women" },
    { title: "KIDS", image: kidsImage, link: "/products/kids" },
  ];

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="w-full bg-gradient-to-b from-white via-white to-white">
        <main className="container mx-auto px-4 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-4xl text-black-700 hover:text-gray-700 mb-6">
                  {category.title}
                </h2>

                <motion.div
                  className="relative overflow-hidden block w-full aspect-square"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={category.link}
                    className="group relative w-full h-full block"
                  >
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Collections;
