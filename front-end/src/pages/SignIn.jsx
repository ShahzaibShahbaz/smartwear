import React from "react";
import modelsImage from "../Assets/photoshootaesthetic.jpeg";

function SignIn() {
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
          <div className="flex flex-col gap-6 lg:gap-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                placeholder="Email"
                className="w-full text-black pl-3 py-2 rounded-md"
                type="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                placeholder="Password"
                className="w-full text-black pl-3 py-2 rounded-md"
                type="password"
              />
              <a className="text-right text-sm mt-1">Forgot password?</a>
            </div>

            <div className="flex flex-col items-center gap-4 lg:gap-6">
              <button className="w-full lg:w-[50%] py-2 bg-black text-white rounded-md text-lg">
                Login
              </button>
              <a className="text-center">
                Don't have an account? Click here to <b>sign up</b>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
