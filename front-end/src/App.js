import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LoaderProvider, useLoader } from "./components/LoaderContext";
import Loader from "./components/Loader";
import SignIn from "./pages/auth/SignIn.jsx";
import Product from "./pages/shopping/Product.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import Home from "./pages/shopping/Home.jsx";
import Cart from "./pages/shopping/Cart.jsx";
import ProductPage from "./pages/shopping/ProductPage.jsx";
import PlaceOrder from "./pages/shopping/PlaceOrder.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AddProductForm from "./pages/admin/AddProduct.jsx";
import ApproveDisapproveProducts from "./pages/admin/ApproveProducts.jsx";
import UserManagement from "./pages/admin/ManageUsers.jsx";
import ManageOrders from "./pages/admin/ManageOrders.jsx";
import Wishlist from "./pages/shopping/Wishlist.jsx";
import OrderSummary from "./pages/shopping/OrderSummary.jsx";
import OrdersPage from "./pages/shopping/Orders.jsx";
import Contact from "./pages/shopping/Contact.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ImageSearchPage from "./pages/shopping/ImageSearch.jsx";
import VirtualTryOn from "./pages/VTO/virtual.jsx";

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
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add-product" element={<AddProductForm />} />
          <Route
            path="/admin/approve-products"
            element={<ApproveDisapproveProducts />}
          />
          <Route path="/admin/manage-users" element={<UserManagement />} />
          <Route path="/admin/manage-orders" element={<ManageOrders />} />
        </Route>
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/your-orders" element={<OrdersPage />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/image-search" element={<ImageSearchPage />} />
        <Route path="/VTO" element={<VirtualTryOn />} />
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
