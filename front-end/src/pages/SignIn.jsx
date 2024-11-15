import react, { useState } from "react";
import Navbar from "../components/Navbar";
import modelsImage from "../Assets/photoshootaesthetic.jpeg";
function SignIn(props) {
  return (
    <>
      <div className="flex">
        <div className="w-[55%] flex justify-center items-center bg-zinc-200 h-screen">
          <div className="w-[70%] flex flex-col gap-12 h-[70%] text-white bg-[#515151] shadow-2xl rounded-md">
            <h1 className="text-4xl font-bold mt-12 ml-12">Welcome.</h1>
            <div className="flex flex-col gap-8 ml-16 mr-44 w-[78%]">
              <div className="flex flex-col gap-2 justify-center">
                <h1>Email</h1>
                <input
                  placeholder="Email"
                  className=" w-[100%] text-black pl-1 rounded-md"
                  type="email"
                ></input>
              </div>
              <div className="flex flex-col gap-2 justify-center ">
                <h1>Password</h1>
                <input
                  placeholder="Password"
                  className="w-[100%] text-black pl-1 rounded-md"
                  type="password"
                ></input>
                <a className="text-right text-sm">Forgot password?</a>
              </div>
              <div className="flex flex-col items-center gap-8">
                <button className="w-[24%] py-2 bg-black text-white rounded-md text-lg ">
                  Login
                </button>
                <a>
                  Don't have an account? click here to <b>sign up</b>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[45%] max-h-screen overflow-hidden">
          <img src={modelsImage} alt="Aesthetic" className="object-cover" />
          <div className="absolute ml-6 top-2 right-2 text-black">
            <h1 className=" ml-[5.5%] text-6xl font-extrabold leading-none">
              SMART
            </h1>
            <h1 className="tracking-[0.9em] text-5xl font-bold leading-tight -mt-2">
              Wear
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
