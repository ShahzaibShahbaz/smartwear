import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LoaderProvider, useLoader } from "./components/LoaderContext";
import Loader from "./components/Loader";

import SignIn from "./pages/SignIn";
import Product from "./pages/Product";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Chatbot from "./pages/Chatbot";
import ProductPage from "./pages/ProductPage";
import PlaceOrder from "./pages/PlaceOrder";
import Wishlist from "./pages/Wishlist";
import OrderSummary from "./pages/OrderSummary";
import OrdersPage from "./pages/Orders";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ImageSearchPage from "./pages/ImageSearch";

function AppRoutes() {
  const location = useLocation();
  const { loading, showLoader, hideLoader } = useLoader();

  useEffect(() => {
    // Show loader on route change
    showLoader();
    const timeout = setTimeout(() => hideLoader(), 500); // Simulate a loading duration
    return () => clearTimeout(timeout); // Cleanup timeout
  }, [location.pathname]); // Only trigger on pathname changes, not hash changes

  useEffect(() => {
    // Handle hash changes without triggering loader
    if (location.hash && location.pathname === "/") {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <>
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/products/:category" element={<ProductPage />} />
        <Route path="/product/:productname" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/your-orders" element={<OrdersPage />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/image-search" element={<ImageSearchPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <LoaderProvider>
      <AppRoutes />
    </LoaderProvider>
  );
}

export default App;
