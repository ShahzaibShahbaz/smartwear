import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Lock, Loader2 } from "lucide-react";
import modelsImage from "../../assets/photoshootaesthetic.jpeg";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Code verification, 3: New password
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/pwd/request-reset", { email });
      toast.success("Reset code sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/pwd/verify-reset-code",
        {
          email: email,
          reset_code: resetCode,
        }
      );

      if (response.status === 200) {
        toast.success("Code verified successfully!");
        setStep(3);
      }
    } catch (error) {
      console.error("Verification error:", error.response?.data);
      toast.error(error.response?.data?.detail || "Invalid reset code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:8000/pwd/reset-password", {
        email,
        reset_code: resetCode,
        new_password: newPassword,
      });
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
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
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleCodeVerification} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                Reset Code
              </label>
              <input
                id="code"
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reset code"
              />
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
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Verify Code"
              )}
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
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
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/signin")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="ml-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 1 && "Enter your email to receive a reset code"}
                {step === 2 && "Enter the reset code sent to your email"}
                {step === 3 && "Create a new password"}
              </p>
            </div>
          </div>

          {renderStep()}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <a
                href="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
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

      <ToastContainer position="top-right" />
    </div>
  );
}

export default ForgotPassword;
