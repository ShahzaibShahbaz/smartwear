import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Bot, User } from "lucide-react";
import Navbar from "../../components/Navbar";

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to SMART wear! I'm your personal styling assistant. How can I help you find your perfect look today?",
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (userMessage.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: data.reply },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setUserMessage("");
    }
  };

  // Remove handleKeyPress as we've moved the logic directly to the textarea onKeyDown

  const renderMessage = (msg, index) => {
    return (
      <div
        key={index}
        className={`flex ${
          msg.sender === "user" ? "justify-end" : "justify-start"
        } mb-6 items-end space-x-2`}
      >
        {msg.sender === "bot" && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-gray-600" />
          </div>
        )}

        <div
          className={`relative p-4 rounded-2xl transition-all duration-200 ${
            msg.sender === "user"
              ? "bg-black text-white rounded-br-none"
              : "bg-gray-100 text-black rounded-bl-none"
          }`}
        >
          <p className="text-sm md:text-base leading-relaxed tracking-wide">
            {msg.text}
          </p>
        </div>

        {msg.sender === "user" && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-4xl h-[80vh] flex flex-col bg-white border rounded-xl shadow-lg relative overflow-hidden">
          {/* Fixed Header */}
          <div className="absolute top-0 left-0 right-0 bg-white border-b z-10">
            <div className="text-center py-8">
              <h1 className="text-4xl font-extrabold text-black tracking-wide">
                Your Personal Stylist
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Discover your perfect style with AI assistance
              </p>
            </div>
          </div>

          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-32 pb-24 scroll-smooth">
            {messages.map((msg, index) => renderMessage(msg, index))}
            {isLoading && (
              <div className="flex items-start space-x-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input Container */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  style={{ resize: "none" }}
                  className="w-full p-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 
                           focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Let's find a look that makes you feel your best..."
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userMessage.trim()}
                  className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 
                           focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                           disabled:bg-gray-200 disabled:cursor-not-allowed
                           transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-6 w-6" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
