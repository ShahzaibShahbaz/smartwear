import React from "react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar"; // Import your navbar component
import menImage from "../Assets/men.jpg";
import womenImage from "../Assets/women.jpg";
import kidsImage from "../Assets/kids.jpg";

const Homepage = () => {
  const categories = [
    { title: "MEN", image: menImage, link: "/men" },
    { title: "WOMEN", image: womenImage, link: "/women" },
    { title: "KIDS", image: kidsImage, link: "/kids" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <Navbar />

      <main className="container mx-auto px-4 min-h-[calc(100vh-80px)] mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-light text-gray-800 mb-6">
                {category.title}
              </h2>

              <motion.a
                href={category.link}
                className="relative overflow-hidden block w-full aspect-square"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="group relative w-full h-full">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                </div>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Homepage;