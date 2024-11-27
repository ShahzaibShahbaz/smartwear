import { useState, useEffect, useRef } from 'react';
import { PaperClipIcon } from '@heroicons/react/20/solid'; // Heroicon for the arrow
import Navbar from "../components/Navbar";

function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [userMessage, setUserMessage] = useState('');

  // Reference to the message container to scroll to the bottom
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (userMessage.trim() === '') return;

    // Add user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: userMessage }
    ]);

    // Simulate bot response (you can replace this with API calls)
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: `You said: ${userMessage}` }
    ]);

    // Clear user input
    setUserMessage('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage(); // Send the message when Enter is pressed
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <div className="w-3/5 h-[60vh] flex flex-col bg-zinc-200 border rounded-lg shadow-lg">
          {/* Chat Title */}
          <div className="text-center text-4xl font-extrabold text-black py-4">
            Your Personal Stylist
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.sender === 'user' ? 'bg-white self-end' : 'bg-white self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {/* This is used to scroll to the bottom when new messages are added */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input and Send Button */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              {/* Input Box */}
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-2 border rounded-lg focus:outline-none"
                placeholder="Let's find a look that makes you feel your best"
              />

              {/* Send Icon (upward arrow icon) */}
              <button
                onClick={handleSendMessage}
                className="p-2 bg-[#515151] text-white rounded-full focus:outline-none"
              >
                <PaperClipIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatbotPage;
