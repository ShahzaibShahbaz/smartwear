import logo from "./logo.svg";
import "./App.css";
import SignIn from "./pages/SignIn";
import Product from "./pages/Product";
import Homepage from "./pages/Homepage";
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </div>
  );
}

export default App;
