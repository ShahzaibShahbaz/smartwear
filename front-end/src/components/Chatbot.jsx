import React, { useState, useRef, useEffect } from "react";
import { X, Send, BotMessageSquare, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! How can I help you today?", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 w-full sm:w-48 md:w-56">
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
            className="w-full mt-2 bg-black text-white py-1 md:py-2 px-2 md:px-4 rounded hover:bg-gray-800 transition-colors text-xs md:text-sm"
          >
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
            className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-40"
            aria-label="Open chat"
          >
            <BotMessageSquare className="w-6 h-6" />
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
              width: !isFullScreen ? "min(96rem, 90vw)" : undefined,
            }}
          >
            {/* Chat Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <BotMessageSquare className="w-5 h-5 mr-2" />
                <h3 className="font-medium truncate">Fashion Assistant</h3>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={toggleFullScreen}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.isProductRecommendation ? (
                    <div className="bg-gray-200 text-black rounded-lg px-4 py-3 max-w-full md:max-w-2xl lg:max-w-3xl">
                      <ProductRecommendation products={message.products} />
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg px-4 py-2 break-words ${
                        message.isBot
                          ? "bg-gray-200 text-black"
                          : "bg-black text-white"
                      }`}
                      style={{ maxWidth: isFullScreen ? "50%" : "85%" }}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="bg-gray-200 text-black rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
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
                  } transition-colors`}
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
