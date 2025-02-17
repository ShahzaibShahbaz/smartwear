import React, { useState } from "react";
import modelsImage from "../Assets/photoshootaesthetic.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { setCartItems } from "../store/cartSlice";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { Lock, Mail, ArrowRight } from "lucide-react";

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
        formData
      );

      if (response.status === 200 || response.status === 201) {
        const { access_token, token_type, user } = response.data;
        setSuccess("Sign in successful. Enjoy :)");

        dispatch(
          setCredentials({
            token_type: token_type,
            token: access_token,
            user: { id: user.id, username: user.username, email: user.email },
          })
        );

        try {
          const cartResponse = await axios.get("http://localhost:8000/cart", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          const cartItems = cartResponse.data.items || [];
          dispatch(setCartItems(cartItems));
        } catch (cartError) {
          console.error("Error fetching cart:", cartError);
          dispatch(setCartItems([]));
        }

        const { from, product } = location.state || {};

        if (from && product) {
          setTimeout(() => {
            navigate(from, {
              replace: true,
              state: { product: product },
            });
          }, 1000);
        } else if (from) {
          setTimeout(() => {
            navigate(from, { replace: true });
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

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={modelsImage}
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20">
          <div className="absolute top-8 left-8 text-white">
            <h1 className="text-6xl font-extrabold leading-none tracking-tighter">
              SMART
            </h1>
            <h2 className="text-4xl font-bold tracking-[0.9em] leading-tight mt-2">
              Wear
            </h2>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent 
                       rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <span className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up now
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
