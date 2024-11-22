import logo from "./logo.svg";
import "./App.css";
import SignIn from "./pages/SignIn";
import Product from "./pages/Product";
import Homepage from "./pages/Homepage";
import Footer from "./components/Footer";
import Product from "./pages/Product";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;
