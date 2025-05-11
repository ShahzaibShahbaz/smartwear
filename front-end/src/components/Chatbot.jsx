import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  BotMessageSquare,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! How can I help you with your fashion needs today?",
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isFullScreen && !isOpen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call the API endpoint with error handling
      const response = await fetch("http://localhost:8000/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || "Sorry, I couldn't process that request.",
        isBot: true,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Set recommended products if they exist
      if (
        data.products &&
        Array.isArray(data.products) &&
        data.products.length > 0
      ) {
        setRecommendedProducts(data.products);

        // Add product recommendations as a bot message
        const productsMessage = {
          id: Date.now() + 2,
          isBot: true,
          isProductRecommendation: true,
          products: data.products,
        };

        setMessages((prev) => [...prev, productsMessage]);
      }
    } catch (error) {
      console.error("Error communicating with chatbot API:", error);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const ProductCard = ({ product }) => {
    const getProductName = () => {
      if (typeof product.name === "string") return product.name;
      if (product.name && product.name.name) return product.name.name;
      return "Unnamed Product";
    };

    return (
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-full sm:w-48 md:w-56">
        <div className="h-32 md:h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url || "/placeholder-product.png"}
            alt={product.name || "Product"}
            className="max-h-full max-w-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-product.png";
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm md:text-base font-medium truncate">
            {product.name || "Product"}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {product.product_type || "Fashion Item"}
          </p>
          <p className="text-xs text-gray-500">
            Color: {product.color || "N/A"}
          </p>
          <p className="text-sm font-semibold mt-2">
            PKR {product.price || "0.00"}
          </p>
          <button
            onClick={() =>
              navigate(`/product/${encodeURIComponent(getProductName())}`, {
                state: { product },
              })
            }
            className="w-full mt-2 bg-black text-white py-1 md:py-2 px-2 md:px-4 rounded hover:bg-gray-800 transition-colors text-xs md:text-sm flex items-center justify-center"
          >
            <ShoppingBag className="w-3 h-3 mr-1" />
            View Product
          </button>
        </div>
      </div>
    );
  };

  const ProductRecommendation = ({ products }) => {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Here are some recommendations for you:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-x-auto pb-2">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
    );
  };

  // Sample fashion-related quick questions
  const quickQuestions = [
    "What's trending in women's fashion?",
    "Find me formal wear for men",
    "Recommend casual outfits for summer",
    "What are the popular colors this season?",
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={toggleChat}
            className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-xl hover:bg-gray-800 transition-colors z-40 flex items-center justify-center group"
            aria-label="Open chat"
          >
            <BotMessageSquare />
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              whileHover={{ width: "auto", opacity: 1 }}
              className="overflow-hidden whitespace-nowrap ml-2"
            >
              Fashion Assistant
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isFullScreen ? "100%" : "384px",
              height: isFullScreen ? "100%" : "600px",
              top: isFullScreen ? 0 : "auto",
              right: isFullScreen ? 0 : 8,
              bottom: isFullScreen ? 0 : 24,
              left: isFullScreen ? 0 : "auto",
              borderRadius: isFullScreen ? 0 : "1rem",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bg-white shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
            style={{
              maxWidth: isFullScreen ? "100%" : "calc(100vw - 4rem)",
              maxHeight: isFullScreen ? "100%" : "calc(100vh - 180px)",
              width: !isFullScreen ? "min(24rem, 90vw)" : undefined,
            }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">SMART wear</h3>
                  <p className="text-xs text-white/70">AI Stylist</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={toggleFullScreen}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.isProductRecommendation ? (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-black rounded-lg px-4 py-3 max-w-full md:max-w-2xl lg:max-w-3xl shadow-sm">
                      <ProductRecommendation products={message.products} />
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg px-4 py-2 break-words shadow-sm ${
                        message.isBot
                          ? "bg-white border border-gray-200 text-gray-800"
                          : "bg-gradient-to-r from-black to-gray-800 text-white"
                      }`}
                      style={{ maxWidth: isFullScreen ? "50%" : "85%" }}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="bg-white border border-gray-200 shadow-sm text-black rounded-lg px-4 py-3">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-600 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length < 3 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(question);
                        setTimeout(() => {
                          handleSendMessage();
                        }, 100);
                      }}
                      className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center"
                    >
                      {question}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about fashion, products, or outfits..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm"
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`ml-2 p-2 rounded-full flex-shrink-0 ${
                    inputValue.trim() && !isLoading
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors shadow-sm`}
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
