import React, { useState } from "react";
import modelsImage from "../Assets/photoshootaesthetic.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { setCartItems } from "../store/cartSlice";
import axiosInstance from "../api/axiosConfig";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { ReducerType } from "@reduxjs/toolkit";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/users/signin",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const { access_token, token_type, user } = response.data;
        console.log("Response:", response.data);
        setSuccess("Sign in successful. Enjoy :)");

        dispatch(
          setCredentials({
            token_type: token_type,
            token: access_token,
            user: { id: user.id, username: user.username, email: user.email },
          })
        );

        try {
          const cartresponse = await axios.get("http://localhost:8000/cart", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          const cartItems = cartresponse.data.items || [];
          dispatch(setCartItems(cartItems));
        } catch (cartError) {
          console.error("Error fetching cart:", cartError);
          dispatch(setCartItems([]));
        }

        const { from, product } = location.state || {};
        if (from) {
          setTimeout(() => {
            navigate(from, { replace: true, state: { product } });
          }, 1000);
        } else {
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1000);
        }
      } else {
        setError(response.data.detail || "Invalid email or password");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("Your account is suspended.");
      } else if (err.response && err.response.status === 401) {
        setError("Your account is not confirmed. ");
      } else {
        console.error("Sign-in error:", err);
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
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
          {success && <p className="text-green-500 text-sm">{success}</p>}
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
                onclick={handleSignIn}
              >
                {loading ? <LoadingSpinner /> : "Login"}
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
