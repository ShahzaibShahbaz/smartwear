import "./App.css";
import SignIn from "./pages/SignIn";
import Product from "./pages/Product";
import Collections from "./pages/Collections";
import SignUp from "./pages/SignUp";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Chatbot from "./pages/Chatbot";
import ProductPage from "./pages/ProductPage";
import PlaceOrder from "./pages/PlaceOrder";
import Wishlist from './pages/Wishlist';
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AddProductForm from "./pages/AdminAddProduct.jsx";
import ApproveDisapproveProducts from "./pages/AdminApproveProducts.jsx";
import UserManagement from "./pages/AdminManageUsers.jsx";
import ManageOrders from "./pages/AdminManageOrders.jsx";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/products/:category" element={<ProductPage />} />

        <Route path="/product/:productname" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add-product" element={<AddProductForm />} />
          <Route path="/admin/approve-products" element={<ApproveDisapproveProducts />} />
          <Route path="/admin/manage-users" element={<UserManagement />} />
          <Route path="/admin/manage-orders" element={<ManageOrders />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
