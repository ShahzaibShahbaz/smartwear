import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, TrendingUp } from "lucide-react";

const Home = () => {
  // Add ref for categories section
  const categoriesRef = useRef(null);

  // Function to handle scroll to categories
  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to handle navigation from other pages
  useEffect(() => {
    const handleCollectionsNavigation = () => {
      const hash = window.location.hash;
      if (hash === "#collections") {
        setTimeout(() => {
          scrollToCategories();
        }, 100);
      }
    };

    handleCollectionsNavigation();
    window.addEventListener("hashchange", handleCollectionsNavigation);

    return () => {
      window.removeEventListener("hashchange", handleCollectionsNavigation);
    };
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/api/placeholder/1920/1080",
      title: "Summer Collection 2025",
      subtitle: "Discover the latest trends in fashion",
      cta: "Shop All",
      link: "/products/all",
      action: "navigate",
    },
    {
      image: "/api/placeholder/1920/1080",
      title: "New Arrivals",
      subtitle: "Be the first to wear our latest designs",
      cta: "Browse Categories",
      action: "scroll",
    },
    {
      image: "/api/placeholder/1920/1080",
      title: "Exclusive Offers",
      subtitle: "Limited time deals on premium fashion",
      cta: "View Collections",
      action: "scroll",
    },
  ];

  const features = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "Free Shipping",
      description: "On orders above PKR 2000",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Premium Quality",
      description: "Handpicked fashion items",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Latest Trends",
      description: "Updated weekly collections",
    },
  ];

  const categories = [
    {
      name: "Men",
      image: "/api/placeholder/600/800",
      link: "/products/Men",
    },
    {
      name: "Women",
      image: "/api/placeholder/600/800",
      link: "/products/Women",
    },
    {
      name: "Kids",
      image: "/api/placeholder/600/800",
      link: "/products/kids",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-screen">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              transition: { duration: 0.8 },
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40">
                <div className="container mx-auto px-4 h-full flex items-center">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: currentSlide === index ? 0 : 20,
                      opacity: currentSlide === index ? 1 : 0,
                    }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-2xl text-white"
                  >
                    <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                    <p className="text-xl mb-8">{slide.subtitle}</p>
                    {slide.action === "scroll" ? (
                      <button
                        onClick={scrollToCategories}
                        className="inline-flex items-center px-8 py-3 bg-white text-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {slide.cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    ) : (
                      <Link
                        to={slide.link}
                        className="inline-flex items-center px-8 py-3 bg-white text-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {slide.cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center p-6 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0 mr-4 text-black">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div ref={categoriesRef} className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <Link to={category.link}>
                  <div className="relative aspect-[3/4]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-20">
                      <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <span className="inline-flex items-center text-white">
                          Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot Button */}
      <Link to="/chatbot">
        <button className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
          🗨️
        </button>
      </Link>
    </div>
  );
};

export default Home;
