import React, { useState } from "react";
import modelsImage from "../Assets/photoshootaesthetic.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { setCartItems } from "../store/cartSlice";
import axiosInstance from "../api/axiosConfig";
import axios from "axios";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axiosInstance.post(
        "http://localhost:8000/users/signin",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const { access_token, token_type, user } = response.data;

        // Dispatch user credentials
        dispatch(
          setCredentials({
            token_type: token_type,
            token: access_token,
            user: { id: user.id, username: user.username, email: user.email },
          })
        );

        // Fetch the cart for the logged-in user
        try {
          const cartresponse = await axiosInstance.get("/cart", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          // Handle empty cart response
          const cartItems = cartresponse.data.items || [];
          dispatch(setCartItems(cartItems));
        } catch (cartError) {
          console.error("Error fetching cart:", cartError);
          // Initialize with an empty cart if cart fetch fails
          dispatch(setCartItems([]));
        }
        const { from, product } = location.state || {};
        navigate(from, {
          replace: true,
          state: { product },
        });
      } else {
        setError(response.data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-[45%] h-[40%] lg:h-full relative">
        <img
          src={modelsImage}
          alt="Aesthetic"
          className="object-cover w-full h-full"
        />
        <div className="absolute top-8 left-8 lg:left-16 text-black">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-none">
            SMART
          </h1>
          <h1 className="tracking-[0.5em] lg:tracking-[0.9em] text-3xl lg:text-5xl font-bold leading-tight -mt-1">
            Wear
          </h1>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex justify-center items-center bg-zinc-200 h-[60%] lg:h-full">
        <div className="w-[90%] lg:w-[70%] flex flex-col gap-8 lg:gap-12 p-6 lg:p-8 bg-[#515151] text-white shadow-2xl rounded-md">
          <h1 className="text-3xl lg:text-4xl font-bold">Welcome.</h1>
          {error && <p className="text-red-500 text-sm -mt-6">{error}</p>}
          <form
            onSubmit={handleSignIn}
            className="flex flex-col gap-6 lg:gap-8"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                placeholder="Email"
                className="w-full text-black pl-3 py-2 rounded-md"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                placeholder="Password"
                className="w-full text-black pl-3 py-2 rounded-md"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <a
                href="/forgot-password"
                onClick={handleForgotPassword}
                className="text-right text-sm mt-1 cursor-pointer"
              >
                Forgot password?
              </a>
            </div>

            <div className="flex flex-col items-center gap-4 lg:gap-6">
              <button
                type="submit"
                className="w-full lg:w-[50%] py-2 bg-black text-white rounded-md text-lg"
              >
                Login
              </button>
              <a
                href="/signup"
                onClick={handleSignUpClick}
                className="text-center cursor-pointer"
              >
                Don't have an account? Click here to <b>sign up</b>
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
