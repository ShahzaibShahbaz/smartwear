import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/contact",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["Pakistan", "Lahore"],
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+92 321 1896779", "Monday to Sunday: 9am - 6pm"],
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["smartwearauth@gmail.com", "We'll respond within 24 hours"],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question or feedback? We're here to help. Send us a message
              and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Information Cards */}
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold ml-4">{info.title}</h3>
                </div>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p
                      key={idx}
                      className={idx === 0 ? "text-gray-900" : "text-gray-600"}
                    >
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 
                           transition-colors flex items-center justify-center disabled:opacity-50 
                           disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default ContactUs;



// import React, { useState } from "react";
// import { MapPin, Phone, Mail, Send, Loader2, ArrowRight } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Footer from "../../components/Footer";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";

// const ContactUs = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const response = await axios.post(
//         "http://localhost:8000/contact",
//         formData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200) {
//         toast.success("Message sent successfully! We'll get back to you soon.");
//         setFormData({
//           name: "",
//           email: "",
//           subject: "",
//           message: "",
//         });
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail ||
//           "Failed to send message. Please try again."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const contactInfo = [
//     {
//       icon: <MapPin className="w-6 h-6" />,
//       title: "Visit Us",
//       details: ["Pakistan", "Lahore"],
//     },
//     {
//       icon: <Phone className="w-6 h-6" />,
//       title: "Call Us",
//       details: ["+92 321 1896779", "Monday to Sunday: 9am - 6pm"],
//     },
//     {
//       icon: <Mail className="w-6 h-6" />,
//       title: "Email Us",
//       details: ["smartwearauth@gmail.com", "We'll respond within 24 hours"],
//     },
//   ];

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Header with background - removed pattern.svg reference */}
//           <div className="relative mb-20 rounded-3xl overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
//             {/* Removed the pattern background that was causing the error */}
//             <div className="relative py-16 px-8 text-center">
//               <h1 className="text-5xl font-bold text-white mb-4">
//                 Get in Touch
//               </h1>
//               <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6 rounded-full"></div>
//               <p className="text-lg text-white/90 max-w-2xl mx-auto">
//                 Have a question or feedback? We're here to help. Send us a message
//                 and we'll respond as soon as possible.
//               </p>
//             </div>
//           </div>

//           <div className="grid lg:grid-cols-3 gap-8 mb-20">
//             {/* Contact Information Cards */}
//             {contactInfo.map((info, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-transform hover:scale-105 hover:shadow-xl"
//               >
//                 <div className="flex items-center mb-6">
//                   <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
//                     {info.icon}
//                   </div>
//                   <h3 className="text-xl font-semibold ml-5">{info.title}</h3>
//                 </div>
//                 <div className="space-y-3">
//                   {info.details.map((detail, idx) => (
//                     <p
//                       key={idx}
//                       className={idx === 0 ? "text-gray-900 font-medium text-lg" : "text-gray-600"}
//                     >
//                       {detail}
//                     </p>
//                   ))}
//                 </div>
//                 <div className="mt-6 pt-6 border-t border-gray-100">
//                   <a href="#" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
//                     Learn more <ArrowRight className="w-4 h-4 ml-2" />
//                   </a>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Contact Form */}
//           <div className="max-w-4xl mx-auto">
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 relative overflow-hidden">
//               {/* Decorative elements with CSS-only styling instead of background images */}
//               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
//               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full -ml-32 -mb-32 opacity-50"></div>
              
//               <div className="relative">
//                 <div className="flex items-center mb-8">
//                   <div className="w-12 h-1 bg-indigo-600 rounded-full mr-4"></div>
//                   <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
//                 </div>
                
//                 <form onSubmit={handleSubmit} className="space-y-8">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     <div>
//                       <label
//                         htmlFor="name"
//                         className="block text-sm font-medium text-gray-700 mb-2"
//                       >
//                         Your Name
//                       </label>
//                       <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         required
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                         placeholder="John Doe"
//                       />
//                     </div>
//                     <div>
//                       <label
//                         htmlFor="email"
//                         className="block text-sm font-medium text-gray-700 mb-2"
//                       >
//                         Your Email
//                       </label>
//                       <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         required
//                         value={formData.email}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                         placeholder="john@example.com"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="subject"
//                       className="block text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Subject
//                     </label>
//                     <input
//                       type="text"
//                       id="subject"
//                       name="subject"
//                       required
//                       value={formData.subject}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                       placeholder="How can we help you?"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="message"
//                       className="block text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Message
//                     </label>
//                     <textarea
//                       id="message"
//                       name="message"
//                       required
//                       value={formData.message}
//                       onChange={handleChange}
//                       rows={6}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                       placeholder="Type your message here..."
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-lg font-medium rounded-xl 
//                              shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1
//                              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="w-5 h-5 mr-3 animate-spin" />
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <Send className="w-5 h-5 mr-3" />
//                         Send Message
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>
            
//             {/* Social Media Links */}
//             <div className="mt-12 text-center">
//               <h3 className="text-xl font-semibold text-gray-800 mb-6">Follow Us</h3>
//               <div className="flex justify-center space-x-6">
//                 {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
//                   <a 
//                     key={social}
//                     href="#" 
//                     className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-lg transition-all"
//                   >
//                     <span className="sr-only">{social}</span>
//                     {/* Using Lucide icons instead of Font Awesome to avoid potential import issues */}
//                     {social === 'facebook' && <div className="w-5 h-5">f</div>}
//                     {social === 'twitter' && <div className="w-5 h-5">t</div>}
//                     {social === 'instagram' && <div className="w-5 h-5">i</div>}
//                     {social === 'linkedin' && <div className="w-5 h-5">in</div>}
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </>
//   );
// };

// export default ContactUs;
