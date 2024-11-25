import logo from "./logo.svg";
import "./App.css";
import SignIn from "./pages/SignIn";
import Product from "./pages/Product";
import Collections from "./pages/Collections";
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductCart from "./components/ProductCart";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/product" element={<Product />} />
      </Routes>
    </div>
  );
}

export default App;
